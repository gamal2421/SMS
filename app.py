from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
CORS(app)

# MySQL URI without ?ssl-mode=REQUIRED
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://avnadmin:AVNS_uuM8yWa7VQRd92EhGev@mysql-2bd8f379-waleedgamal2821-a9bd.k.aivencloud.com:14381/defaultdb'
# Add SSL config for development (no CA file, disables hostname check)
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'connect_args': {
        'ssl': {'check_hostname': False}
    }
}
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your_secret_key'

db = SQLAlchemy(app)

# --- Models ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    first_name = db.Column(db.String(80), nullable=False)
    last_name = db.Column(db.String(80), nullable=False)
    grade = db.Column(db.String(20))
    section = db.Column(db.String(20))

class Teacher(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(80), nullable=False)
    last_name = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    subject = db.Column(db.String(80), nullable=False)
    contact = db.Column(db.String(80), nullable=True)

# --- Routes ---
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    if User.query.filter((User.email == data['email']) | (User.username == data['username'])).first():
        return jsonify({'message': 'User already exists'}), 400
    user = User(
        username=data['username'],
        email=data['email'],
        password=data['password'],  # For demo only! Hash in production!
        role=data['role'],
        first_name=data['firstName'],
        last_name=data['lastName']
    )
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'User registered successfully', 'user': {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'role': user.role,
        'firstName': user.first_name,
        'lastName': user.last_name
    }}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    if not user or user.password != data['password']:
        return jsonify({'message': 'Invalid credentials'}), 401
    return jsonify({'message': 'Login successful', 'user': {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'role': user.role,
        'firstName': user.first_name,
        'lastName': user.last_name
    }})

@app.route('/api/students', methods=['GET'])
def get_students():
    students = User.query.filter_by(role='student').all()
    return jsonify([{
        'id': s.id,
        'username': s.username,
        'email': s.email,
        'firstName': s.first_name,
        'lastName': s.last_name,
        'grade': s.grade,
        'section': s.section
    } for s in students])

@app.route('/api/students', methods=['POST'])
def add_student():
    data = request.json
    user = User(
        username=data['username'],
        email=data['email'],
        password=data['password'],
        role='student',
        first_name=data['firstName'],
        last_name=data['lastName'],
        grade=data.get('grade', ''),
        section=data.get('section', '')
    )
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'Student added successfully'}), 201

@app.route('/api/teachers', methods=['GET'])
def get_teachers():
    teachers = Teacher.query.all()
    return jsonify([{
        'id': t.id,
        'firstName': t.first_name,
        'lastName': t.last_name,
        'email': t.email,
        'subject': t.subject,
        'contact': t.contact
    } for t in teachers])

@app.route('/api/teachers', methods=['POST'])
def add_teacher():
    data = request.json
    teacher = Teacher(
        first_name=data['firstName'],
        last_name=data['lastName'],
        email=data['email'],
        subject=data['subject'],
        contact=data.get('contact', '')
    )
    db.session.add(teacher)
    db.session.commit()
    return jsonify({'message': 'Teacher added successfully'}), 201

@app.route('/api/teachers/<int:id>', methods=['DELETE'])
def delete_teacher(id):
    teacher = Teacher.query.get(id)
    if not teacher:
        return jsonify({'message': 'Teacher not found'}), 404
    db.session.delete(teacher)
    db.session.commit()
    return jsonify({'message': 'Teacher deleted'})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True) 