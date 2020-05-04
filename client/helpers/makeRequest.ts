import axios from "axios";
import log from "./logger";

//TODO Update with deployed IPs
function getServerPath(serverName: String) {
  if (serverName == "client") return "http://localhost:8000";
  else return "ERROR";
}

function makeRequest(
  server: String,
  route: String,
  method: String = "GET",
  data: Object = {}
) {
  const serverPath = getServerPath(server);
  if (serverPath == "ERROR") {
    log("error", "Invalid server path");
    return { success: 0, message: "Invalid server path." };
  }
  if (method == "GET") {
    return axios
      .get(`${serverPath}/${route}`)
      .then((res) => {
        return res.data;
      })
      .catch((error) => {
        log("error", error);
        return { success: -1, message: "Error connecting to server" };
      });
  } else if (method == "POST") {
    return axios
      .post(`${serverPath}/${route}`, data)
      .then((res) => {
        return res.data;
      })
      .catch((error) => {
        log("error", error);
        return { success: -1, message: "Error connecting to server" };
      });
  } else {
    return { success: 0, message: "Invalid http method." };
  }
}

module.exports = makeRequest;
