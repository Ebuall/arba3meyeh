import {
  Button,
  Card as MaterialCard,
  CardActions,
  CardContent,
  CardHeader,
  Typography,
} from "@material-ui/core";
import Slider from "@material-ui/lab/Slider";
import { updateIn } from "immutable";
import * as React from "react";
import { GameState, PlayerState, Team } from "../backend/game";
import { Card, mapNullable } from "../model";
import { SuccessProps, InitialProps } from "./user";
const stringify = require("json-stringify-pretty-compact");

function strings<L extends string>(...args: L[]) {
  return args;
}

export class UserView extends React.PureComponent<SuccessProps> {
  state = { bid: 2 };
  handleSlider = (_ev: any, bid: number) => {
    return this.setState({ bid });
  };
  submitBid = () => {
    this.props.submitBid(this.state.bid);
  };
  render() {
    const { data, name } = this.props;
    const { bid } = this.state;
    const pretty = updateIn(
      updateIn(data, ["hand"], a => a.map(Card.show)),
      ["board"],
      a => a.map(mapNullable(Card.show)),
    );
    return (
      <MaterialCard
        style={{
          width: "calc(50% - 1px)",
          border: `2px solid ${data.index % 2 ? "blue" : "red"}`,
          margin: 0.5,
        }}
      >
        <CardHeader
          titleTypographyProps={{
            color: data.index % 2 ? "primary" : "secondary",
          }}
          title={"Automated player " + name}
        />
        <CardContent>
          <pre>{stringify(pretty, { maxLength: 120 })}</pre>
          {data.state == GameState.Over && (
            <Typography
              variant="title"
              color={strings("default", "secondary", "primary")[data.winner]}
            >
              {Team[data.winner]} team won! Your score {data.scores[data.index]}
            </Typography>
          )}
        </CardContent>
        <CardActions>
          {data.state == GameState.Tricks && (
            <Button onClick={() => this.props.playCard(0)}>Send card</Button>
          )}
          {data.state == GameState.Bids && (
            <div style={{ width: 300 }}>
              Your bid {bid}
              <Button onClick={this.submitBid}>Submit</Button>
              <Slider
                value={bid}
                min={2}
                max={13}
                step={1}
                onChange={this.handleSlider}
              />
            </div>
          )}
          <Button color="default" onClick={this.props.leaveGame}>
            Leave
          </Button>
        </CardActions>
      </MaterialCard>
    );
  }
}

export const ConnectPage: React.StatelessComponent<InitialProps> = props => (
  <Button onClick={props.onClick}>Connect</Button>
);
