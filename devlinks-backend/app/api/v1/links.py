from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.link import Link
from app.schemas.link import LinkCreate, LinkUpdate, LinkResponse
from app.core.response import success, error, page as page_response
from typing import List
import httpx
from urllib.parse import urlparse
from concurrent.futures import ThreadPoolExecutor, as_completed

router = APIRouter(redirect_slashes=False)

@router.get("")
def get_links(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    category_id: int = Query(None),
    search: str = Query(None),
    environment: str = Query(None)
):
    query = db.query(Link)
    
    if category_id is not None:
        query = query.filter(Link.category_id == category_id)
    if search:
        query = query.filter(Link.title.contains(search) | Link.description.contains(search))
    if environment:
        query = query.filter(Link.environment == environment)
    
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    
    return success(data=page_response(items, total, page, page_size))

@router.get("/{link_id}")
def get_link(link_id: int, db: Session = Depends(get_db)):
    link = db.query(Link).filter(Link.id == link_id).first()
    if not link:
        return error(code=404, message="链接不存在")
    return success(data=link)

@router.post("")
def create_link(link: LinkCreate, db: Session = Depends(get_db)):
    db_link = Link(**link.model_dump())
    db.add(db_link)
    db.commit()
    db.refresh(db_link)
    return success(data=db_link)

@router.put("/{link_id}")
def update_link(link_id: int, link: LinkUpdate, db: Session = Depends(get_db)):
    db_link = db.query(Link).filter(Link.id == link_id).first()
    if not db_link:
        return error(code=404, message="链接不存在")
    for key, value in link.model_dump(exclude_unset=True).items():
        setattr(db_link, key, value)
    db.commit()
    db.refresh(db_link)
    return success(data=db_link)

@router.delete("/batch")
def batch_delete_links(ids: List[int] = Body(...), db: Session = Depends(get_db)):
    deleted = db.query(Link).filter(Link.id.in_(ids)).delete(synchronize_session=False)
    db.commit()
    return success(message=f"成功删除 {deleted} 个链接")

@router.delete("/{link_id}")
def delete_link(link_id: int, db: Session = Depends(get_db)):
    db_link = db.query(Link).filter(Link.id == link_id).first()
    if not db_link:
        return error(code=404, message="链接不存在")
    db.delete(db_link)
    db.commit()
    return success(message="链接删除成功")

@router.post("/check")
def check_links_status(db: Session = Depends(get_db)):
    links = db.query(Link).filter(Link.status != "archived").all()
    
    if not links:
        return success(data={"checked": 0, "active": 0, "inactive": 0}, message="没有需要检测的链接")

    def check_single_link(link_url, link_status):
        try:
            with httpx.Client(timeout=3.0) as client:
                response = client.head(link_url, follow_redirects=True)
                return (response.status_code < 400, None)
        except Exception as e:
            return (False, str(e))

    link_map = {link.id: link for link in links}
    
    checked_count = 0
    active_count = 0
    inactive_count = 0
    
    with ThreadPoolExecutor(max_workers=20) as executor:
        futures = {
            executor.submit(check_single_link, link.url, link.status): link.id
            for link in links
        }
        
        for future in as_completed(futures):
            link_id = futures[future]
            link = link_map[link_id]
            checked_count += 1
            
            try:
                is_ok, error_msg = future.result()
                if is_ok:
                    if link.status != "active":
                        link.status = "active"
                        active_count += 1
                else:
                    if link.status != "inactive":
                        link.status = "inactive"
                        inactive_count += 1
            except Exception:
                if link.status != "inactive":
                    link.status = "inactive"
                    inactive_count += 1
    
    db.commit()
    
    return success(data={
        "checked": checked_count,
        "active": active_count,
        "inactive": inactive_count
    }, message=f"检测完成，共检测 {checked_count} 个链接")

@router.post("/{link_id}/fetch-favicon")
def fetch_link_favicon(link_id: int, db: Session = Depends(get_db)):
    link = db.query(Link).filter(Link.id == link_id).first()
    if not link:
        return error(code=404, message="链接不存在")
    
    try:
        parsed_url = urlparse(link.url)
        domain = parsed_url.netloc
        base_url = f"{parsed_url.scheme}://{domain}"
        
        favicon_url = f"{base_url}/favicon.ico"
        
        with httpx.Client(timeout=5.0) as client:
            response = client.head(favicon_url, follow_redirects=True)
            if response.status_code < 400:
                link.favicon = favicon_url
                db.commit()
                db.refresh(link)
                return success(data={"favicon": favicon_url}, message="获取图标成功")
        
        link.favicon = f"https://www.google.com/s2/favicons?domain={domain}&sz=64"
        db.commit()
        db.refresh(link)
        return success(data={"favicon": link.favicon}, message="使用默认图标")
    except Exception as e:
        domain = urlparse(link.url).netloc
        link.favicon = f"https://www.google.com/s2/favicons?domain={domain}&sz=64"
        db.commit()
        db.refresh(link)
        return success(data={"favicon": link.favicon}, message="使用默认图标")

@router.post("/{link_id}/fetch-preview")
def fetch_link_preview(link_id: int, db: Session = Depends(get_db)):
    link = db.query(Link).filter(Link.id == link_id).first()
    if not link:
        return error(code=404, message="链接不存在")
    
    try:
        from bs4 import BeautifulSoup
        
        with httpx.Client(timeout=15.0, follow_redirects=True) as client:
            response = client.get(link.url, headers={"User-Agent": "Mozilla/5.0"})
            
            if response.status_code < 400:
                html_content = response.text[:10000]
                soup = BeautifulSoup(html_content, "html.parser")
                
                title_tag = soup.find("title")
                if title_tag and title_tag.text.strip():
                    link.title = title_tag.text.strip()
                
                meta_desc = soup.find("meta", attrs={"name": "description"})
                if meta_desc and meta_desc.get("content"):
                    link.description = meta_desc["content"]
                
                og_image = soup.find("meta", attrs={"property": "og:image"})
                if og_image and og_image.get("content"):
                    link.preview_image = og_image["content"]
                
                db.commit()
                db.refresh(link)
                
                return success(data={
                    "title": link.title,
                    "description": link.description,
                    "preview_image": link.preview_image
                }, message="获取预览信息成功")
        
        return error(code=400, message="获取预览信息失败")
    except httpx.TimeoutException:
        return error(code=408, message="请求超时，请检查网络连接")
    except httpx.RequestError as e:
        return error(code=500, message=f"网络请求失败: {str(e)}")
    except Exception as e:
        return error(code=500, message=f"获取预览信息失败: {str(e)}")
