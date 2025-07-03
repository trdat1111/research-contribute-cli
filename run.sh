#!/bin/bash
caffeinate -i pm2 restart research-cron || pm2 start auto-index.js --name research-cron
