from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from app.models.product import ProductVersion
from app.models.eco import Eco


class VersionManager:
    """Handles atomic version transitions when an ECO is applied."""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from app.models.product import ProductVersion
from app.models.bom import Bom, BomComponent, BomOperation
from app.models.eco import Eco


class VersionManager:
    """Handles atomic version transitions when an ECO is applied."""

    async def apply_eco(self, eco: Eco, session: AsyncSession) -> None:
        """Apply an ECO's proposed changes atomically."""
        if eco.eco_type == "BoM":
            await self._apply_bom_eco(eco, session)
            return

        # Product ECOs — fetch current version BEFORE archiving so fields are never lost
        result = await session.execute(
            select(ProductVersion).where(
                ProductVersion.product_id == eco.target_product_id,
                ProductVersion.status == "Active",
                ProductVersion.is_latest == True,  # noqa: E712
            )
        )
        current = result.scalar_one_or_none()
        # Snapshot fields we must preserve
        prev_snapshot = {
            "product_name": current.product_name if current else None,
            "sale_price": current.sale_price if current else None,
            "cost_price": current.cost_price if current else None,
            "attachments_url": current.attachments_url if current else None,
        }

        if eco.version_update_toggle:
            new_version_number = await self._archive_current_version(eco.target_product_id, session)
            await self._create_new_version(eco, new_version_number, prev_snapshot, session)
        else:
            await self._patch_current_version(eco, session)

    async def _apply_bom_eco(self, eco: Eco, session: AsyncSession) -> None:
        """
        Archive the current BoM and create a new one carrying forward the
        current (post-edit) components and operations.
        """
        # Load the current BoM with its components and operations
        from sqlalchemy.orm import selectinload
        result = await session.execute(
            select(Bom)
            .where(Bom.bom_id == eco.target_bom_id)
            .options(selectinload(Bom.components), selectinload(Bom.operations))
        )
        current_bom = result.scalar_one_or_none()
        if current_bom is None:
            return

        # Snapshot current state before archiving
        old_version = current_bom.bom_version
        old_components = [
            {"product_id": c.product_id, "quantity": float(c.quantity), "unit_of_measure": c.unit_of_measure}
            for c in current_bom.components
        ]
        old_operations = [
            {"work_center": op.work_center, "operation_time_mins": op.operation_time_mins, "sequence_order": op.sequence_order}
            for op in current_bom.operations
        ]
        product_version_id = current_bom.product_version_id
        reference = current_bom.reference
        quantity = current_bom.quantity
        unit_of_measure = current_bom.unit_of_measure

        # Archive the current BoM
        current_bom.status = "Archived"
        await session.flush()

        # Derive new version name: increment trailing number if present, else append " 2"
        import re
        match = re.match(r'^(.*?)(\s+(\d+))?$', old_version)
        base = match.group(1) if match else old_version
        num = int(match.group(3)) if match and match.group(3) else 1
        new_bom_version = f"{base} {num + 1}"

        # Create new active BoM
        new_bom = Bom(
            product_version_id=product_version_id,
            bom_version=new_bom_version,
            reference=reference,
            quantity=quantity,
            unit_of_measure=unit_of_measure,
            status="Active",
        )
        session.add(new_bom)
        await session.flush()  # get new_bom.bom_id

        # Copy components to new BoM
        for c in old_components:
            session.add(BomComponent(
                bom_id=new_bom.bom_id,
                product_id=c["product_id"],
                quantity=c["quantity"],
                unit_of_measure=c["unit_of_measure"],
            ))

        # Copy operations to new BoM
        for op in old_operations:
            session.add(BomOperation(
                bom_id=new_bom.bom_id,
                work_center=op["work_center"],
                operation_time_mins=op["operation_time_mins"],
                sequence_order=op["sequence_order"],
            ))

        # Update the ECO to point to the new BoM
        eco.target_bom_id = new_bom.bom_id
        await session.flush()

        # Product ECOs — fetch current version BEFORE archiving so fields are never lost
        result = await session.execute(
            select(ProductVersion).where(
                ProductVersion.product_id == eco.target_product_id,
                ProductVersion.status == "Active",
                ProductVersion.is_latest == True,  # noqa: E712
            )
        )
        current = result.scalar_one_or_none()
        # Snapshot fields we must preserve
        prev_snapshot = {
            "product_name": current.product_name if current else None,
            "sale_price": current.sale_price if current else None,
            "cost_price": current.cost_price if current else None,
            "attachments_url": current.attachments_url if current else None,
        }

        if eco.version_update_toggle:
            new_version_number = await self._archive_current_version(eco.target_product_id, session)
            await self._create_new_version(eco, new_version_number, prev_snapshot, session)
        else:
            await self._patch_current_version(eco, session)

    async def _archive_current_version(self, product_id: int, session: AsyncSession) -> int:
        """
        Set is_latest=False, status='Archived' on the current active version.
        Returns the current version_number so we can increment it.
        """
        result = await session.execute(
            select(ProductVersion).where(
                ProductVersion.product_id == product_id,
                ProductVersion.status == "Active",
                ProductVersion.is_latest == True,  # noqa: E712
            )
        )
        current = result.scalar_one_or_none()
        if current is None:
            # No active version found — start at version 0 so new will be 1
            return 0

        current.status = "Archived"
        current.is_latest = False
        await session.flush()
        return current.version_number

    async def _create_new_version(self, eco: Eco, prev_version_number: int, prev_snapshot: dict, session: AsyncSession) -> None:
        """Insert a new ProductVersion with incremented version_number and status='Active'."""
        changes = eco.proposed_changes or {}
        
        # Filter out snapshot fields (they're used for display, not for actual version creation)
        actual_changes = {k: v for k, v in changes.items() if not k.startswith("snapshot_")}
        
        new_version = ProductVersion(
            product_id=eco.target_product_id,
            version_number=prev_version_number + 1,
            # Always carry forward product_name — never overwrite it via ECO
            product_name=prev_snapshot.get("product_name") or "",
            # Apply proposed changes; fall back to previous values if not in changes
            sale_price=actual_changes["sale_price"] if "sale_price" in actual_changes else prev_snapshot.get("sale_price"),
            cost_price=actual_changes["cost_price"] if "cost_price" in actual_changes else prev_snapshot.get("cost_price"),
            attachments_url=actual_changes["attachments_url"] if "attachments_url" in actual_changes else prev_snapshot.get("attachments_url"),
            status="Active",
            is_latest=True,
            created_by=eco.created_by,
        )
        session.add(new_version)
        await session.flush()

    async def _patch_current_version(self, eco: Eco, session: AsyncSession) -> None:
        """Apply proposed_changes to the existing active version without changing version_number."""
        result = await session.execute(
            select(ProductVersion).where(
                ProductVersion.product_id == eco.target_product_id,
                ProductVersion.status == "Active",
                ProductVersion.is_latest == True,  # noqa: E712
            )
        )
        current = result.scalar_one_or_none()
        if current is None:
            return

        changes = eco.proposed_changes or {}
        # Filter out snapshot fields
        for field in ("sale_price", "cost_price", "attachments_url"):
            if field in changes and changes[field] is not None:
                setattr(current, field, changes[field])
        await session.flush()


version_manager = VersionManager()
