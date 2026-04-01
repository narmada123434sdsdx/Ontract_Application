import logging
from app import db
from sqlalchemy import text

class CityModel:

    @staticmethod
    def get_all_cities():
        logging.info("Fetching all cities with state + region name")

        sql = text("""
            SELECT 
                a.*, 
                b.state_name,
                c.region_name
            FROM city_master_t a
            JOIN state_master_t b ON a.state_id = b.state_id
            JOIN region_master_t c ON a.region_id = c.region_id
            ORDER BY a.city_id ASC
        """)

        result = db.session.execute(sql)
        return [dict(row._mapping) for row in result]


    @staticmethod
    def insert_city(city_name, region_id, state_id, status):
        logging.info("Inserting new city")

        sql = text("""
            INSERT INTO city_master_t (city_name, region_id, state_id, status)
            VALUES (:city_name, :region_id, :state_id, :status)
        """)

        db.session.execute(sql, {
            "city_name": city_name,
            "region_id": region_id,
            "state_id": state_id,
            "status": status
        })
        db.session.commit()
        return True


    @staticmethod
    def update_city(id, city_name, status):
        sql = text("""
            UPDATE city_master_t
            SET city_name = :city_name,
                status = :status
            WHERE id = :id
        """)

        db.session.execute(sql, {
            "id": id,
            "city_name": city_name,
            "status": status
        })
        db.session.commit()
        return True


    @staticmethod
    def delete_city(id):
        sql = text("DELETE FROM city_master_t WHERE id = :id")
        db.session.execute(sql, {"id": id})
        db.session.commit()
        return True
    
    @staticmethod
    def get_city_by_region_state(region_id, state_id):
        sql = text("""
            SELECT *
            FROM city_master_t
            WHERE region_id = :region
            AND state_id = :state
            ORDER BY city_id ASC
        """)

        rows = db.session.execute(sql, {
            "region": region_id,
            "state": state_id
        }).mappings().all()

        return [dict(r) for r in rows]