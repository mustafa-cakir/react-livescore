import React, {Component} from 'react';
import Icon from "./Icon";
import Mp3Goal from "../assets/sound/goal.mp3";
import Mp3Cancel from "../assets/sound/cancel.mp3";
import Mp3Finish from "../assets/sound/finish.mp3";
import Mp3HalfTime from "../assets/sound/half-time.mp3";
import Mp3Start from "../assets/sound/start.mp3";
import Mp3RedCard from "../assets/sound/red-card.mp3";
import {withNamespaces} from "react-i18next";

class FlashScoreBoard extends Component {
	constructor(props) {
		super(props);
		this.state = {
			flashScoreBoardData: null,
			flashScoreMuted: false,
			flashScoreShrinked: false,
			flashData: null
		};
		this.handleSocketFlashScoreChanges = this.handleSocketFlashScoreChanges.bind(this);
		this.flashScoreTimer = null;
		this.socket = this.props.socket;
	}

	componentWillUnmount() {
		this.socket.emit('is-flashscore-active', false);
		clearTimeout(this.flashScoreTimer);
	}

	componentDidMount() {
		this.analyzeSessionStorage();
		this.socket.on('connect', () => {
			this.socket.emit('is-flashscore-active', true);
		});

		this.socket.removeListener('return-flashcore-changes', this.handleSocketFlashScoreChanges);
		this.socket.on('return-flashcore-changes', this.handleSocketFlashScoreChanges);
	}

	playSound(type) {
		if (!this.state.flashScoreMuted) {
			setTimeout(() => {
				if (type === "goal")  new Audio(Mp3Goal).play();
				else if (type === "cancel") new Audio(Mp3Cancel).play();
				else if (type === "finish") new Audio(Mp3Finish).play();
				else if (type === "red-card") new Audio(Mp3RedCard).play();
				else if (type === "half-time") new Audio(Mp3HalfTime).play();
				else if (type === "start") new Audio(Mp3Start).play();
			}, 500);
		}
	}

	analyzeSessionStorage() {
		let storageFlashScoreMuted = JSON.parse(localStorage.getItem('FlashScoreMuted')),
			storageFlashScoreShrinked = JSON.parse(localStorage.getItem('flashScoreShrinked'));

		if (storageFlashScoreShrinked || storageFlashScoreMuted) {
			this.setState({
				flashScoreMuted: storageFlashScoreMuted,
				flashScoreShrinked: storageFlashScoreShrinked
			});
		}
	}


	handleSocketFlashScoreChanges(res) {
		const {t} = this.props;
		if (res && res.length > 0) {
			res.forEach(x => {
				x.forEach(change => {
					console.log(change);
					if (change.kind === "E" && change.event && change.event.id) {
						if ((change.path[0] === "homeScore" || change.path[0] === "awayScore") && change.path[1] === "current") { // home or away scored!!
							if (parseInt(change.rhs) > parseInt(change.lhs)) {
								change.desc = t("GOOAL!");
								this.playSound('goal');
							} else {
								change.desc = t("Goal Cancelled");
								this.playSound('goal-cancelled');
							}
						}
						if (change.path[0] === "homeRedCards" || change.path[0] === "awayRedCards") {
							change.desc = t("Red Card");
							this.playSound('red-card');
						}
						if (change.path[0] === "status" && change.path[1] === "code") { // status update
							if (change.lhs === 0 && change.rhs === 6) { // game started
								change.desc = t("Game Started");
								this.playSound('red-card');
							} else if (change.lhs === 6 && change.rhs === 31) { // half time
								change.desc = t("Half Time Result");
								this.playSound('half-time');
							} else if (change.lhs === 31 && change.rhs === 6) { // 2nd half started
								change.desc = t("2nd Half Started");
								this.playSound('half-time');
							} else if (change.rhs === 100) { // full time
								change.desc = t("Full Time Result");
								this.playSound('finished');
							}
						}

						if (change.desc) {
							this.setState({
								flashData: change
							}, () => {
								clearTimeout(this.flashScoreTimer);
								this.flashScoreTimer = setTimeout(() => {
									this.setState({flashData: null})
								}, 15000);
							});
						}
					}
				});
			});
		}
	}

	shrinkToggle() {
		this.setState({
			flashScoreShrinked: !this.state.flashScoreShrinked
		}, () => {
			localStorage.setItem('flashScoreShrinked', this.state.flashScoreShrinked);
		})
	}

	muteToggle() {
		this.setState({
			flashScoreMuted: !this.state.flashScoreMuted
		}, () => {
			localStorage.setItem('FlashScoreMuted', this.state.flashScoreMuted);
		})
	}

	render() {
		const {flashData, flashScoreShrinked, flashScoreMuted} = this.state;
		if (!flashData) return false;
		return (
			<div className={"flash-score-board " + (flashScoreShrinked ? "shrink" : "")}>
				<div className="container">
					<div className="shrink-btn" onClick={this.shrinkToggle.bind(this)}><Icon
						name={"fas fa-chevron-" + (flashScoreShrinked ? "up" : "down")}/></div>
					<div className="row align-items-center content">
						<div className="col col-minute">{flashData.event.statusDescription}'</div>
						<div className="col home-team text-center">
							<img
								src={`https://www.sofascore.com/images/team-logo/football_${flashData.event.homeTeam.id}.png`}
								className="team-logo"
								alt={flashData.event.homeTeam.name}/>
							<div className="team-name">{flashData.event.homeTeam.name}</div>
						</div>
						<div className="col col-score">
							{flashData.path[0] === "homeRedCards" ? <div className="red-card home flash-blinker-5">{flashData.event.homeRedCards}</div> : ""}
							{flashData.path[0] === "awayRedCards" ? <div className="red-card away flash-blinker-5">{flashData.event.awayRedCards}</div> : ""}
							<div className="desc">{flashData.desc ? flashData.desc : ""}</div>
							<span
								className={"home " + (flashData.path[0] === "homeScore" ? "flash-blinker-5" : "")}>{flashData.event.homeScore.current}</span>
							<span className="separator">:</span>
							<span
								className={"away " + (flashData.path[0] === "awayScore" ? "flash-blinker-5" : "")}>{flashData.event.awayScore.current}</span>
						</div>
						<div className="col away-team text-center">
							<img
								src={`https://www.sofascore.com/images/team-logo/football_${flashData.event.awayTeam.id}.png`}
								className="team-logo"
								alt={flashData.event.awayTeam.name}/>
							<div className="team-name">{flashData.event.awayTeam.name}</div>
						</div>
						<div className={"col col-sound " + (flashScoreMuted ? "muted" : "")}
						     onClick={this.muteToggle.bind(this)}><Icon
							name={"fas fa-volume-" + (flashScoreMuted ? "off" : "up")}/></div>
					</div>
				</div>
			</div>
		)
	}
}

export default withNamespaces('translations')(FlashScoreBoard)
