# websocket_manager.py - Add this to your FastAPI backend

from fastapi import WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from typing import Dict, List, Optional
import json
import jwt
import asyncio
from datetime import datetime

class NotificationWebSocketManager:
    def __init__(self):
        # Store active connections by user_id
        self.active_connections: Dict[str, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        """Connect a websocket for a specific user"""
        await websocket.accept()
        
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        
        self.active_connections[user_id].append(websocket)
        print(f"WebSocket connected for user {user_id}. Total connections: {len(self.active_connections[user_id])}")
    
    def disconnect(self, websocket: WebSocket, user_id: str):
        """Disconnect a websocket for a specific user"""
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            
            # Clean up empty user connections
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        
        print(f"WebSocket disconnected for user {user_id}")
    
    async def send_to_user(self, user_id: str, message: dict):
        """Send a message to all websockets for a specific user"""
        if user_id not in self.active_connections:
            return
        
        message_str = json.dumps(message)
        disconnected_websockets = []
        
        for websocket in self.active_connections[user_id]:
            try:
                await websocket.send_text(message_str)
            except Exception as e:
                print(f"Error sending message to websocket: {e}")
                disconnected_websockets.append(websocket)
        
        # Clean up disconnected websockets
        for websocket in disconnected_websockets:
            self.disconnect(websocket, user_id)
    
    async def send_unread_count_update(self, user_id: str, unread_count: int):
        """Send unread count update to user"""
        message = {
            "type": "notification_count_update",
            "data": {
                "unreadCount": unread_count
            }
        }
        await self.send_to_user(user_id, message)
    
    async def send_new_notification(self, user_id: str, notification: dict, unread_count: int):
        """Send new notification to user"""
        message = {
            "type": "new_notification",
            "data": {
                "notification": notification,
                "unreadCount": unread_count
            }
        }
        await self.send_to_user(user_id, message)
    
    async def send_notification_read(self, user_id: str, notification_id: str, unread_count: int):
        """Send notification read update to user"""
        message = {
            "type": "notification_read",
            "data": {
                "notificationId": notification_id,
                "unreadCount": unread_count
            }
        }
        await self.send_to_user(user_id, message)

# Global WebSocket manager instance
notification_ws_manager = NotificationWebSocketManager()

# Add this to your main FastAPI app file (main.py or app.py)

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query, HTTPException
from your_auth_module import verify_token  # Replace with your actual auth module

app = FastAPI()

async def get_user_from_websocket_token(token: str):
    """Verify WebSocket token and return user"""
    try:
        # Decode JWT token - adjust this based on your auth implementation
        payload = jwt.decode(token, "your-secret-key", algorithms=["HS256"])  # Replace with your secret
        user_id = payload.get("sub")  # or however you store user_id in token
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        return user_id
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.websocket("/ws/notifications")
async def websocket_notifications_endpoint(
    websocket: WebSocket,
    token: str = Query(...)
):
    """WebSocket endpoint for real-time notifications"""
    try:
        # Verify token and get user
        user_id = await get_user_from_websocket_token(token)
        
        # Connect websocket
        await notification_ws_manager.connect(websocket, user_id)
        
        # Send initial unread count
        # You'll need to implement get_user_unread_count() based on your database
        initial_unread_count = await get_user_unread_count(user_id)
        await notification_ws_manager.send_unread_count_update(user_id, initial_unread_count)
        
        try:
            while True:
                # Keep connection alive and handle any incoming messages
                data = await websocket.receive_text()
                # You can handle incoming messages here if needed
                print(f"Received message from user {user_id}: {data}")
                
        except WebSocketDisconnect:
            notification_ws_manager.disconnect(websocket, user_id)
            
    except HTTPException:
        await websocket.close(code=1008, reason="Authentication failed")
    except Exception as e:
        print(f"WebSocket error: {e}")
        await websocket.close(code=1011, reason="Internal server error")

# Helper functions you'll need to implement based on your database setup

async def get_user_unread_count(user_id: str) -> int:
    """Get unread notification count for a user"""
    # Implement based on your database
    # Example:
    # return await db.query("SELECT COUNT(*) FROM notifications WHERE user_id = ? AND read = FALSE", user_id)
    pass

async def create_notification_for_user(user_id: str, notification_data: dict):
    """Create a notification and send real-time update"""
    # 1. Save notification to database
    # saved_notification = await save_notification_to_db(user_id, notification_data)
    
    # 2. Get updated unread count
    # unread_count = await get_user_unread_count(user_id)
    
    # 3. Send real-time update
    # await notification_ws_manager.send_new_notification(
    #     user_id, 
    #     saved_notification, 
    #     unread_count
    # )
    pass

# Modify your existing notification endpoints to send WebSocket updates

@app.patch("/notification/{notification_id}/read")
async def mark_notification_as_read(
    notification_id: str,
    current_user = Depends(get_current_user)  # Replace with your auth dependency
):
    """Mark notification as read and send WebSocket update"""
    # 1. Mark as read in database
    # await mark_notification_read_in_db(notification_id, current_user.id)
    
    # 2. Get updated unread count
    # unread_count = await get_user_unread_count(current_user.id)
    
    # 3. Send WebSocket update
    # await notification_ws_manager.send_notification_read(
    #     current_user.id,
    #     notification_id,
    #     unread_count
    # )
    
    return {"status": "success"}

@app.patch("/notification/mark-all-read")
async def mark_all_notifications_as_read(
    current_user = Depends(get_current_user)  # Replace with your auth dependency
):
    """Mark all notifications as read and send WebSocket update"""
    # 1. Mark all as read in database
    # await mark_all_notifications_read_in_db(current_user.id)
    
    # 2. Send WebSocket update (unread count will be 0)
    # await notification_ws_manager.send_unread_count_update(current_user.id, 0)
    
    return {"status": "success"}