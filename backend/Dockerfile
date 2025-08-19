# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /code

# Copy the requirements file into the container
COPY ./requirements.txt /code/requirements.txt

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Copy the app code into the container
COPY ./app /code/app

# Expose the port the app runs on
EXPOSE 8000

# Define the command to run the app
# The --host 0.0.0.0 is important to make the container accessible from the outside
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
