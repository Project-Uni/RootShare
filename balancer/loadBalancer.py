from flask import Flask, request, redirect
import sys
sys.path.append('./helpers')
from logger import log
from makeRequest import makeRequest, getServerPath
from sendPacket import sendPacket


app = Flask(__name__)
PORT = 8001

@app.route('/', methods=['GET'])
def index():
  log('redirect', "Redirecting to client server")
  return redirect(getServerPath('client'))

if __name__ == "__main__":
  log('info', "Listening on port "+str(PORT) + ", " + str(app.config['ENV']) + " environment.")
  app.run(debug=True, host='0.0.0.0', port=PORT)