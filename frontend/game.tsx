import * as React from "react";
import io from "socket.io-client";
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  CardActions,
} from "@material-ui/core";
import omit from "lodash/omit";
var stringify = require("json-stringify-pretty-compact");

export class GameDebug extends React.Component {
  socket!: SocketIOClient.Socket;
  state = { data: null as any };
  componentDidMount() {
    const name = "$DEBUG";
    this.socket = io("http://localhost:3555", { query: { name } });
    this.socket.on("connect", () => console.log(name, "connected"));
  }
  inspect = () => {
    this.socket.emit("inspect", (data: any) => {
      this.setState({ data });
    });
  };
  render() {
    const { data } = this.state;
    return (
      <Card>
        <CardHeader title="GameDebug" />
        <CardContent>
          {data && (
            <div>
              {/* <pre>{JSON.stringify(data[0].hands)}</pre> */}
              <pre>{stringify(omit(data[0], "hands"), null, 2)}</pre>
            </div>
          )}
        </CardContent>
        <CardActions>
          <Button onClick={this.inspect}>Inspect</Button>
        </CardActions>
      </Card>
    );
  }
}
