import { CssBaseline, TextField } from "@material-ui/core";
import { Range } from "immutable";
import * as React from "react";
import { render } from "react-dom";
import { UserDebug } from "./user";

class DebugView extends React.Component {
  state = { delay: 200 };
  setDelay = (_ev: any, delay: number = _ev.target.value) =>
    this.setState({ delay });
  render() {
    return (
      <div style={{ fontSize: "1.5em" }}>
        <CssBaseline />
        <div style={{ padding: "0 36px 36px 36px" }}>
          <TextField
            value={this.state.delay}
            onChange={this.setDelay}
            label="Delay"
          />
        </div>
        {/* <GameDebug /> */}
        <div /* style={{ display: "flex", flexWrap: "wrap" }} */>
          {Range(1, 5).map((n, _i, _c, name = "User" + n) => (
            <UserDebug key={name} name={name} delay={this.state.delay} />
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
    throw "whatever";
  });
}
