FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create data directory
RUN mkdir -p data

# Make startup script executable
RUN chmod +x startup.sh

# Expose port
EXPOSE 8000

# Start with initialization script
CMD ["./startup.sh"]
