import os
from urllib.parse import urlparse
from uuid import uuid4

from flask import current_app, url_for
from werkzeug.utils import secure_filename


class StorageError(ValueError):
    pass


ALLOWED_IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.gif'}


def _build_public_url(relative_path: str) -> str:
    media_base_url = current_app.config.get('MEDIA_BASE_URL')
    normalized = relative_path.replace('\\', '/').lstrip('/')
    if media_base_url:
        return f"{media_base_url.rstrip('/')}/{normalized}"
    return url_for('media_file', filename=normalized, _external=True)


def save_product_images(product_id: int, files):
    upload_dir = os.path.join(current_app.config['UPLOAD_ROOT'], 'products')
    os.makedirs(upload_dir, exist_ok=True)

    saved = []
    for file in files:
        original_name = secure_filename(file.filename or '')
        ext = os.path.splitext(original_name)[1].lower()
        if ext not in ALLOWED_IMAGE_EXTENSIONS:
            continue

        stored_name = f'{product_id}-{uuid4().hex}{ext}'
        file_path = os.path.join(upload_dir, stored_name)
        file.save(file_path)
        saved.append({'url': _build_public_url(f'products/{stored_name}'), 'path': file_path})

    if not saved:
        raise StorageError('Solo aceptamos archivos jpg, jpeg, png, webp o gif.')

    return saved


def delete_local_media_by_url(url: str | None):
    if not url:
        return

    parsed = urlparse(url)
    path = parsed.path or ''
    marker = '/media/'
    index = path.find(marker)
    if index == -1:
        return

    relative_path = path[index + len(marker):].replace('/', os.sep)
    file_path = os.path.join(current_app.config['UPLOAD_ROOT'], relative_path)
    if os.path.isfile(file_path):
        os.remove(file_path)
