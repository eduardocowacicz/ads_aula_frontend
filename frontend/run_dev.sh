#!/bin/bash
tmux kill-session -t senac-frontend 2>/dev/null
tmux new-session -d -s senac-frontend "cd '/mnt/c/Users/vitor/Desktop/senac/ads_aula_frontend/frontend' && npm run dev 2>&1 | tee /tmp/frontend.log"
sleep 10
cat /tmp/frontend.log | tail -20
