import os
from werkzeug.utils import secure_filename
from app.config import Config

def save_uploaded_file(file, subfolder=""):
    if not file or not file.filename:
        return None

    filename = secure_filename(file.filename)

    folder = os.path.join(Config.UPLOAD_FOLDER, subfolder)
    os.makedirs(folder, exist_ok=True)

    filepath = os.path.join(folder, filename)
    print("file path",filepath)
    file.save(filepath)

    return filepath  # ← store this in DB
