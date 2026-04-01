from app import create_app

app = create_app(include_admin=True)

if __name__ == "__main__":
    app.run(port=5000, debug=True)