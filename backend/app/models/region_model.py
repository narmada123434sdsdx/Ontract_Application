import logging  
from app import db
from sqlalchemy import text

class RegionModel:

    @staticmethod
    def get_all_regions():
        logging.info(f"calling or not:")
        sql = text("SELECT * FROM region_master_t ORDER BY region_id ASC")
        logging.info(f"checkingoutput: '{sql}'")
        result = db.session.execute(sql)
        return [dict(row._mapping) for row in result]

    @staticmethod
    def insert_region(region_name, status):
        sql = text("""
            INSERT INTO region_master_t (region_name, status)
            VALUES (:name, :status)
        """)
        db.session.execute(sql, {"name": region_name, "status": status})
        db.session.commit()
        return True

    @staticmethod
    def update_region(id, region_name, status):
        sql = text("""
            UPDATE region_master_t
            SET region_name = :name,
            status = :status
            WHERE id = :id
        """)
        db.session.execute(sql, {"id": id, "name": region_name, "status": status})
        db.session.commit()
        return True

    @staticmethod
    def delete_region(id):
        sql = text("DELETE FROM region_master_t WHERE id = :id")
        db.session.execute(sql, {"id": id})
        db.session.commit()
        return True
