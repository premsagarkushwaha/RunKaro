FROM python:3.11-slim

# Create a non-root user for security
RUN useradd -ms /bin/bash runner

# Install common Python packages (optional, add more if you need them)
RUN pip install --no-cache-dir numpy pandas matplotlib

# Switch to non-root user
USER runner

# Default work directory inside container
WORKDIR /workspace

# Default command
CMD ["python3"]
