#!/usr/bin/env python3
"""
Simple HTTP server for the Slum Mapping India frontend
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8001

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def main():
    # Change to the directory containing the HTML files
    web_dir = os.path.dirname(os.path.realpath(__file__))
    os.chdir(web_dir)
    
    # Create server
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"URBAN ANALYTICS PLATFORM - SERVER INITIALIZING...")
        print(f"SERVER ENDPOINT: http://localhost:{PORT}")
        print(f"SERVING DIRECTORY: {web_dir}")
        print(f"LAUNCHING BROWSER INTERFACE...")
        print(f"PRESS CTRL+C TO TERMINATE SERVER")
        
        # Open browser automatically
        webbrowser.open(f'http://localhost:{PORT}')
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print(f"\nSERVER TERMINATED.")
            sys.exit(0)

if __name__ == "__main__":
    main()
