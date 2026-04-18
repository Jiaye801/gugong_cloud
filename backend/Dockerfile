FROM python:3.9-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Copy app code
COPY . .

# Set environment variables
ENV FLASK_APP=app
ENV PYTHONUNBUFFERED=1

# Initialize database
RUN python run.py init-db

# Expose port
EXPOSE 5000

# Run with gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "--timeout", "120", "--access-logfile", "-", "--error-logfile", "-", "wsgi:app"]
