#!/bin/bash
# Health monitoring script - ensures portfolio stays running
# Add to crontab: */5 * * * * /home/ubuntu/portfolio-monitor.sh

# Check if container exists and is running
if ! docker ps | grep -q portfolio; then
    echo "$(date): Portfolio container not running, attempting restart..."
    
    # Try to start existing container
    docker start portfolio 2>/dev/null
    
    # If container doesn't exist, check for image and recreate
    if [ $? -ne 0 ]; then
        echo "$(date): Container doesn't exist, checking for image..."
        if docker images | grep -q portfolio; then
            docker run -d \
                --name portfolio \
                --restart always \
                -p 80:8000 \
                -e RUST_LOG=info \
                -e HOST=0.0.0.0 \
                -e PORT=8000 \
                --memory="512m" \
                --cpus="0.5" \
                portfolio:latest
            echo "$(date): Created new container from latest image"
        else
            echo "$(date): ERROR - No portfolio image found!"
        fi
    fi
fi

# Health check
if ! curl -sf http://localhost/health -o /dev/null; then
    echo "$(date): Health check failed, restarting container..."
    docker restart portfolio
    sleep 10
    
    # Final check
    if ! curl -sf http://localhost/health -o /dev/null; then
        echo "$(date): ERROR - Container still unhealthy after restart!"
    fi
fi