# Use the latest GCC image
FROM gcc:latest

# Create a non-root user for security
RUN useradd -ms /bin/bash runner
USER runner

# Set working directory
WORKDIR /workspace

# Default command (just runs bash if nothing passed)
CMD ["bash"]
