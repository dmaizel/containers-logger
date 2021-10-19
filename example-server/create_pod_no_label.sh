docker build -f test-pods/Dockerfile . -t no-label
docker run -d -p 8887:8887 no-label
