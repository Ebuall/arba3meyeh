import {
  Button,
  CssBaseline,
  FormControlLabel,
  Switch,
  TextField,
} from "@material-ui/core";
import { Range } from "immutable";
import * as React from "react";
import { render } from "react-dom";
import { parseBool } from "../model";
import { UserConnection } from "./user";
import { ConnectPage, UserView } from "./userView";

const USER_COUNT: 1 | 4 = 1;

function nullGuard<V, D extends V>(v: V | undefined | null, d: D) {
  return v == null ? d : v;
}
class DebugView extends React.Component {
  state = {
    delay: Number(nullGuard(localStorage.getItem("delay"), "100")),
    autoPlay: parseBool(localStorage.getItem("autoPlay")),
  };
  setDelay = (_ev: any, delay: number = _ev.target.value) => {
    localStorage.setItem("delay", delay.toString());
    return this.setState({ delay });
  };
  setAutoPlay = (_ev: any, autoPlay: boolean = _ev.target.value) => {
    localStorage.setItem("autoPlay", autoPlay.toString());
    return this.setState({ autoPlay });
  };
  render() {
    const { autoPlay, delay } = this.state;
    return (
      <div style={{ fontSize: "1.5em" }}>
        <CssBaseline />
        <div style={{ padding: "0 36px 36px 36px" }}>
          <FormControlLabel
            label="AutoPlay"
            labelPlacement="end"
            style={{ marginLeft: 20 }}
            control={<Switch onChange={this.setAutoPlay} checked={autoPlay} />}
          />
          <Button onClick={() => this.setDelay(null, delay + 50)}>
            Slower
          </Button>
          <TextField
            value={delay}
            onChange={this.setDelay}
            label="Delay"
            style={{ width: 50 }}
          />
          <Button onClick={() => this.setDelay(null, Math.max(delay - 50, 0))}>
            Faster
          </Button>
        </div>
        {/* <GameDebug /> */}
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {Range(1, USER_COUNT + 1).map((n, _i, _c, name = "User" + n) => (
            <UserConnection
              forceSolo={USER_COUNT === 1}
              key={name}
              user={{ name, id: name }}
              url="http://localhost:3555"
              delay={delay}
              autoPlay={autoPlay}
              Initial={ConnectPage}
              Pending={() => <span>Loading...</span>}
              Failure={({ err }) => <span>Error: {JSON.stringify(err)}</span>}
              Success={UserView}
            />
          ))}
        </div>
      </div>
    );
  }
}

render(<DebugView />, document.getElementById("app"));

declare const module: any;
if (module.hot) {
  module.hot.dispose(() => {
    window.location.reload();
    throw "reload";
  });
}
