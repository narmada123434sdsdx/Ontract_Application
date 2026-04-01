import logging  
from app import db
from sqlalchemy import text

class StateModel:

    @staticmethod
    def get_all_states():
        logging.info("Fetching all states with region name")

        sql = text("""
            SELECT 
                a.*, 
                b.region_name 
            FROM state_master_t a
            JOIN region_master_t b 
                ON a.region_id = b.region_id
            ORDER BY a.state_id ASC
        """)

        logging.info(f"SQL Executing: {sql}")

        result = db.session.execute(sql)
        return [dict(row._mapping) for row in result]


    @staticmethod
    def insert_state(state_name, region_id, status):
        logging.info(f"checkingit once: ")
        sql = text("""
            INSERT INTO state_master_t (state_name, region_id, status)
            VALUES (:name, :region_id, :status)
        """)
        db.session.execute(sql, {"name": state_name, "region_id": region_id, "status": status})
        db.session.commit()
        return True

    @staticmethod
    def update_state(id, state_name):
        sql = text("""
            UPDATE state_master_t
            SET state_name = :name
            WHERE id = :id
        """)
        db.session.execute(sql, {"id": id, "name": state_name})
        db.session.commit()
        return True

    @staticmethod
    def delete_state(id):
        sql = text("DELETE FROM state_master_t WHERE id = :id")
        db.session.execute(sql, {"id": id})
        db.session.commit()
        return True
    

    @staticmethod
    def get_states_by_region(region_id):
        sql = text("""
            SELECT * FROM state_master_t
            WHERE region_id = :region_id
            ORDER BY state_id ASC
        """)
        result = db.session.execute(sql, {"region_id": region_id})
        return [dict(row._mapping) for row in result]


    @staticmethod
    def get_id_types():
        sql = "SELECT id_type FROM identity_document_types_t WHERE status='Active'"
        result = db.session.execute(text(sql))
        return [row.id_type for row in result]