from flask import Flask
import sys
sys.path.append('./helpers')
from logger import log
from makeRequest import makeRequest, getServerPath
from sendPacket import sendPacket

app = Flask(__name__)
PORT = 8002

@app.route('/', methods=['GET'])
def index():
  return "You are on the ranker"

if __name__ == '__main__':
  log('info', "Listening on port "+str(PORT))
  app.run(debug=True, host='0.0.0.0', port=PORT)