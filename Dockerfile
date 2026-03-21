# Use an official, lightweight Python image
FROM python:3.10-slim

# Set environment variables so Python prints logs directly to the terminal
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set the working directory inside the container
WORKDIR /app

# Install system dependencies required for PostgreSQL
RUN apt-get update && apt-get install -y gcc libpq-dev && rm -rf /var/lib/apt/lists/*

# Copy your requirements file and install dependencies
# Note: Ensure you have run 'pip freeze > requirements.txt' on your local machine first!
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn psycopg2-binary

# Copy the rest of your Django project into the container
COPY . /app/

# Expose the port the app runs on
EXPOSE 8000

# Command to run the production server (Gunicorn is the standard for Django)
CMD ["gunicorn", "identity_service.wsgi:application", "--bind", "0.0.0.0:8000"]