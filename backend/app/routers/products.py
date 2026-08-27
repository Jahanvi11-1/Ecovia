from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.core.deps import get_current_user, require_roles
from app.models.product import Product, ProductVersion
from app.models.user import User
from app.schemas.product import ProductOut, ProductVersionOut, ProductCreate, PaginatedProductsOut

router = APIRouter(prefix="/api/products", tags=["products"])
_engineering_admin = require_roles("Admin", "Engineering User")


@router.post("/", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
async def create_product(
    payload: ProductCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(_engineering_admin),
):
    # Check product_code uniqueness
    result = await db.execute(select(Product).where(Product.product_code == payload.product_code))
    if result.scalar_one_or_none() is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Product code already exists")

    product = Product(product_code=payload.product_code)
    db.add(product)
    await db.flush()  # get product_id

    version = ProductVersion(
        product_id=product.product_id,
        version_number=1,
        product_name=payload.product_name,
        sale_price=payload.sale_price,
        cost_price=payload.cost_price,
        attachments_url=payload.attachments_url,
        status="Active",
        is_latest=True,
        created_by=current_user.user_id,
    )
    db.add(version)
    await db.commit()
    await db.refresh(product)

    result2 = await db.execute(
        select(Product)
        .where(Product.product_id == product.product_id)
        .options(selectinload(Product.versions))
    )
    product = result2.scalar_one()
    active_version = next((v for v in product.versions if v.status == "Active" and v.is_latest), None)
    return ProductOut(
        product_id=product.product_id,
        product_code=product.product_code,
        created_at=product.created_at,
        active_version=ProductVersionOut.model_validate(active_version) if active_version else None,
        versions=[ProductVersionOut.model_validate(v) for v in product.versions],
    )


@router.get("/", response_model=PaginatedProductsOut)
async def list_products(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=10000),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Get total count for pagination
    count_result = await db.execute(select(func.count(Product.product_id)))
    total_count = count_result.scalar()
    
    # Apply pagination
    offset = (page - 1) * limit
    result = await db.execute(
        select(Product)
        .options(selectinload(Product.versions))
        .offset(offset)
        .limit(limit)
    )
    products = result.scalars().all()

    output = []
    for product in products:
        active_version = next(
            (v for v in product.versions if v.status == "Active" and v.is_latest),
            None,
        )
        output.append(
            ProductOut(
                product_id=product.product_id,
                product_code=product.product_code,
                created_at=product.created_at,
                active_version=ProductVersionOut.model_validate(active_version) if active_version else None,
                versions=[],
            )
        )
    
    total_pages = (total_count + limit - 1) // limit  # Ceiling division
    
    return PaginatedProductsOut(
        items=output,
        total=total_count,
        page=page,
        limit=limit,
        pages=total_pages
    )


@router.get("/{product_id}", response_model=ProductOut)
async def get_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Product)
        .where(Product.product_id == product_id)
        .options(selectinload(Product.versions))
    )
    product = result.scalar_one_or_none()
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    sorted_versions = sorted(product.versions, key=lambda v: v.version_number)
    active_version = next(
        (v for v in sorted_versions if v.status == "Active" and v.is_latest),
        None,
    )

    return ProductOut(
        product_id=product.product_id,
        product_code=product.product_code,
        created_at=product.created_at,
        active_version=ProductVersionOut.model_validate(active_version) if active_version else None,
        versions=[ProductVersionOut.model_validate(v) for v in sorted_versions],
    )


@router.get("/{product_id}/versions", response_model=list[ProductVersionOut])
async def list_product_versions(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(ProductVersion)
        .where(ProductVersion.product_id == product_id)
        .order_by(ProductVersion.version_number)
    )
    versions = result.scalars().all()
    return [ProductVersionOut.model_validate(v) for v in versions]
