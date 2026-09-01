FROM ollama/ollama:latest


RUN ollama serve & \
    SERVER_PID=$! && \
    sleep 10 && \
    ollama pull llama3.2 && \
    kill $SERVER_PID

EXPOSE 11434

ENTRYPOINT ["ollama", "serve"]