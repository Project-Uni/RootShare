#TODO UPDATE SERVER PATHS BASED ON CONFIG
def getServerPath(serverName):
  if serverName == 'client':
    return 'http://localhost:8000'
  else:
    return "ERROR"

def makeRequest(server, route, method="GET", data={}):
  serverPath = getServerPath(server)
  res='ERROR'
  if serverPath == 'ERROR':
    print("Error: Invalid server path")
    return res
  if method == 'GET':
    try:
      res=requests.get(serverPath+'/'+route, timeout=3)
      res.raise_for_status()
      res = res.content
    except (requests.exceptions.HTTPError, requests.exceptions.ConnectionError, requests.exceptions.Timeout, requests.exceptions.RequestException) as err:
      log('error', err)
      return res

  elif method == 'POST':
    try:
      res=requests.post(serverPath+'/'+route, data, timeout=3)
      res.raise_for_status()
      res=res.content
    except (requests.exceptions.HTTPError, requests.exceptions.ConnectionError, requests.exceptions.Timeout, requests.exceptions.RequestException) as err:
      log('error', err)
      return res
  if res=='ERROR':
    return res
  return json.loads(res.decode('utf-8'))