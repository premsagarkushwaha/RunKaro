# FROM openjdk:17-slim

# # Create a non-root user for security
# RUN useradd -ms /bin/bash runner

# USER runner
# WORKDIR /workspace

# CMD ["java"]

FROM openjdk:17

# Create a non-root user for security
RUN useradd -ms /bin/bash runner
USER runner

WORKDIR /workspace
CMD ["java"]
