from flask import Flask, request

app = Flask(__name__)
PORT = 8001

@app.route('/', methods=['GET'])
def index():
  return 'Hello I am the load balancer'

if __name__ == "__main__":
  print("Listening on port "+str(PORT))
  app.run(debug=True, host='0.0.0.0', port=PORT)