from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.til import TIL
from app.schemas.til import TILCreate, TILUpdate, TILResponse, TILLikeResponse
from app.core.response import success, error, page as page_response
from datetime import datetime, timedelta

router = APIRouter(redirect_slashes=False)

@router.get("")
def get_tils(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: str = Query(None),
    tags: str = Query(None),
    project: str = Query(None),
    archive: str = Query(None)
):
    query = db.query(TIL)

    if search:
        query = query.filter(TIL.title.contains(search) | TIL.content.contains(search))
    if tags:
        tag_list = [t.strip() for t in tags.split(",")]
        for tag in tag_list:
            query = query.filter(TIL.tags.contains(tag))
    if project:
        query = query.filter(TIL.project == project)
    if archive == "week":
        query = query.filter(TIL.created_at >= datetime.utcnow() - timedelta(days=7))
    elif archive == "month":
        query = query.filter(TIL.created_at >= datetime.utcnow() - timedelta(days=30))

    query = query.order_by(TIL.created_at.desc())

    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()

    return success(data=page_response(items, total, page, page_size))

@router.get("/{til_id}")
def get_til(til_id: int, db: Session = Depends(get_db)):
    til = db.query(TIL).filter(TIL.id == til_id).first()
    if not til:
        return error(code=404, message="TIL 不存在")
    return success(data=til)

@router.post("")
def create_til(til: TILCreate, db: Session = Depends(get_db)):
    db_til = TIL(**til.model_dump())
    db.add(db_til)
    db.commit()
    db.refresh(db_til)
    return success(data=db_til)

@router.put("/{til_id}")
def update_til(til_id: int, til: TILUpdate, db: Session = Depends(get_db)):
    db_til = db.query(TIL).filter(TIL.id == til_id).first()
    if not db_til:
        return error(code=404, message="TIL 不存在")
    for key, value in til.model_dump(exclude_unset=True).items():
        setattr(db_til, key, value)
    db.commit()
    db.refresh(db_til)
    return success(data=db_til)

@router.delete("/{til_id}")
def delete_til(til_id: int, db: Session = Depends(get_db)):
    db_til = db.query(TIL).filter(TIL.id == til_id).first()
    if not db_til:
        return error(code=404, message="TIL 不存在")
    db.delete(db_til)
    db.commit()
    return success(message="TIL 删除成功")

@router.post("/{til_id}/like")
def like_til(til_id: int, db: Session = Depends(get_db)):
    db_til = db.query(TIL).filter(TIL.id == til_id).first()
    if not db_til:
        return error(code=404, message="TIL 不存在")
    db_til.likes += 1
    db.commit()
    db.refresh(db_til)
    return success(data=TILLikeResponse.model_validate(db_til))
