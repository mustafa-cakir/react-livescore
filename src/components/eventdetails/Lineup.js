import React, {Component} from 'react';
import Loading from "../Loading";

class Lineup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lineupData: null,
            defaultFormation: 1,
            activeTeam: null,
            listTab: 0
        };
    }

    componentDidMount() {
        const {eventData} = this.props;
        this.getData("/event/" + eventData.event.id + "/lineups/json");
    };

    componentDidUpdate() {
        this.props.swipeAdjustHeight()
    }

    getData = api => {
        let jsonData = {};
        fetch('https://www.sofascore.com' + api, {referrerPolicy: "no-referrer", cache: "no-store"})
            .then(res => res.json())
            .then(
                (result) => {
                    jsonData = result;
                },
                (error) => {
                    jsonData = {error: error.toString()};
                }
            )
            .then(() => {
                this.setState({
                    lineupData: jsonData,
                    activeTeam: jsonData.homeTeam
                });
            })
    };

    listTabHandler(selection) {
        this.setState({
            listTab: selection
        });
    }

    formationSwitchHandler(option) {
        this.setState({
            defaultFormation: option,
            activeTeam: (option === 1) ? this.state.lineupData.homeTeam : this.state.lineupData.awayTeam
        });
    }

    ratingClass(value) {
        value = Number(value);
        if (value > 8.0) {
            return "amazing bg";
        } else if (value > 7.5) {
            return "great bg";
        } else if (value > 6.9) {
            return "good bg"
        } else if (value > 5.9) {
            return "mediocre bg";
        } else if (value > 4.9) {
            return "underwhelming bg";
        } else {
            return "unrated bg";
        }
    }

    render() {
        const {lineupData, activeTeam} = this.state;
        const {eventData} = this.props;
        if (!lineupData) return <Loading/>;

        const homeFormation = lineupData.homeTeam.formation,
            awayFormation = lineupData.awayTeam.formation;

        const formationReverse = [...activeTeam.formation].reverse();
        let iteration = 11;

        return (
            <div>
                <div className="lineup container">
                    <div className="white-box mt-2">
                        <div className="formation">
                            <div className="row">
                                <div className={"col home" + (this.state.defaultFormation === 1 ? " active" : "")}
                                     onClick={() => this.formationSwitchHandler(1)}>
                                    <img
                                        alt={eventData.event.homeTeam.name}
                                        src={'https://www.sofascore.com/images/team-logo/football_' + eventData.event.homeTeam.id + '.png'}
                                    />
                                    {homeFormation.map((item, index) => {
                                        return (
                                            <span
                                                key={index}>{item}{index === homeFormation.length - 1 ? "" : " - "}</span>
                                        )
                                    })}
                                </div>
                                <div className={"col away" + (this.state.defaultFormation === 2 ? " active" : "")}
                                     onClick={() => this.formationSwitchHandler(2)}>
                                    {awayFormation.map((item, index) => {
                                        return (
                                            <span
                                                key={index}>{item}{index === awayFormation.length - 1 ? "" : " - "}</span>
                                        )
                                    })}
                                    <img alt={eventData.event.awayTeam.name}
                                         src={'https://www.sofascore.com/images/team-logo/football_' + eventData.event.awayTeam.id + '.png'}/>
                                </div>
                            </div>
                        </div>
                        <div className="pitch">
                            <div className={"area-container row-" + formationReverse.length}>
                                {formationReverse.map((item, index) => {
                                    return (
                                        <div key={index} className={"area area-" + item}>
                                            <div className="row">
                                                {[...Array(parseInt(item))].map((x, i) => {
                                                        iteration--;
                                                        return (
                                                            <div key={i} className="col text-center">
                                                                <div className="player-container">
                                                                    <div className="picture">
                                                                        <img
                                                                            alt={activeTeam.lineupsSorted[iteration].player.name}
                                                                            src={"https://www.sofascore.com/images/player/image_" + activeTeam.lineupsSorted[iteration].player.id + ".png"}/>
                                                                        {activeTeam.lineupsSorted[iteration].rating ? <span
                                                                            className={"text-bold rating " + this.ratingClass(activeTeam.lineupsSorted[iteration].rating)}>{activeTeam.lineupsSorted[iteration].rating}</span> : ""}
                                                                    </div>
                                                                    <div className="clearfix"/>
                                                                    <div className="name" style={{
                                                                        background: '#' + activeTeam.color.player.outline,
                                                                        color: '#' + activeTeam.color.player.number
                                                                    }}>
                                                                        <span>{activeTeam.lineupsSorted[iteration].player.shortName}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    }
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                                <div className={"area area-1"}>
                                    <div className="row">
                                        <div className="col text-center">
                                            <div className="player-container">
                                                <div className="picture">
                                                    <img
                                                        alt={activeTeam.lineupsSorted[0].player.name}
                                                        src={"https://www.sofascore.com/images/player/image_" + activeTeam.lineupsSorted[0].player.id + ".png"}/>
                                                    {activeTeam.lineupsSorted[0].rating ? <span
                                                        className={"text-bold rating " + this.ratingClass(activeTeam.lineupsSorted[0].rating)}>{activeTeam.lineupsSorted[0].rating}</span> : ""}

                                                </div>
                                                <div className="clearfix"/>
                                                <div className="name" style={{
                                                    background: '#' + activeTeam.color.goalkeeper.outline,
                                                    color: '#' + activeTeam.color.goalkeeper.number
                                                }}>
                                                    <span>{activeTeam.lineupsSorted[0].player.shortName}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row pb-2">
                            <div className="col">
                                <div className="row align-items-center">
                                    <div className="col col-coach-picture">
                                        <img
                                            alt={activeTeam.manager.name}
                                            className="coach-picture"
                                            src={"https://api.sofascore.com/api/v1/manager/" + activeTeam.manager.id + "/image"}
                                        />
                                    </div>
                                    <div className="col">
                                        <div className="coach-name f-700">{activeTeam.manager.name}</div>
                                        <div className="text-gray">Coach</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col col-5 text-right right-info">
                                {!activeTeam.confirmedLineups ?
                                    <div className="possible-lineup">Possible Lineup!</div> : ""}
                                {activeTeam.rating ?
                                    <div className="team-rating">Team Avg. Rating: <span
                                        className={"text-bold rating " + this.ratingClass(activeTeam.rating)}>{activeTeam.rating}</span>
                                    </div> : ""}

                                {activeTeam.averageAge.startersAverageAge ?
                                    <div className="mt-1">Avg. Age: <span
                                        className="f-500"> {activeTeam.averageAge.startersAverageAge}</span></div> : ""}
                            </div>
                        </div>
                        <div className="body list">
                            <ul className="horizontal-tab">
                                <li className={this.state.listTab === 0 ? "active" : ""}
                                    onClick={() => this.listTabHandler(0)}><span>Lineup</span></li>
                                <li className={this.state.listTab === 1 ? "active" : ""}
                                    onClick={() => this.listTabHandler(1)}><span>Substitues</span></li>
                            </ul>
                            {activeTeam.lineupsSorted.map((item, index) => {
                                if (this.state.listTab === 0 && item.substitute) return false;
                                if (this.state.listTab === 1 && !item.substitute) return false;
                                return (
                                    <div key={index}
                                         className="row list-row align-items-center">
                                        <div className="col list-image">
                                            <img
                                                alt={item.player.name}
                                                src={"https://www.sofascore.com/images/player/image_" + item.player.id + ".png"}/>
                                        </div>

                                        <div className="col list-text">
                                            <div className="f-700">{item.shirtNumber} - {item.player.name} {item.captain ? <span className="captain">C</span> : ""} </div>
                                            <div className="text-gray">{item.positionName}</div>
                                        </div>
                                        {item.rating ? <div className="col list-rating"><span
                                            className={"text-bold rating " + this.ratingClass(item.rating)}>{item.rating}</span>
                                        </div> : ""}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Lineup
