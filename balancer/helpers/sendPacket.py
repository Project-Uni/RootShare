def sendPacket(success:int, message:str, content={}):
  return {'success': success, 'message': message, 'content': content}