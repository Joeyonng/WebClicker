import React from 'react';
import {connect} from 'react-redux';
import {withRouter} from "react-router-dom";

import SwipeableViews from 'react-swipeable-views';

import {withStyles} from '@material-ui/core/styles';
import withWidth from "@material-ui/core/withWidth";
import Container from "@material-ui/core/Container";

import InstructorPoll from "./InstructorPoll";
import {changePolls} from "../redux";
import {fetchPolls} from "../firebaseApi";

const styles = theme => ({
    appBarSpacer: theme.mixins.toolbar,
    mainPage: props => ({
        zIndex: 0,
        marginLeft: props.userMenuOpen ? 260 : 0,
        marginRight: props.sessionMenuOpen ? 260 : 0,
        transition: theme.transitions.create(['margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    }),
});

class InstructorPolls extends React.Component {
    constructor(props) {
        super(props);
        //console.log("InstructorPolls Constructor", this.props);

        this.state = {
        };
    }

    componentDidMount() {
        //console.log('InstructorPolls: componentDidMount', this.props);

        let data = {
            sessionID: this.props.match.params.sessionID,
        };

        fetchPolls(data).then(data => {
            this.props.changePolls(data);
        });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        //console.log('InstructorPolls: componentDidUpdate', prevProps, this.props);

        if(this.props.match.params.sessionID !== prevProps.match.params.sessionID) {
            let data = {
                sessionID: this.props.match.params.sessionID,
            };

            fetchPolls(data).then(data => {
                this.props.changePolls(data);
            });
        }
    }

    componentWillUnmount() {
        //console.log('InstructorPolls: componentWillUnmount');
    }

    render() {
        let mobile = this.props.width === 'sm' || this.props.width === 'xs';

        return (
            <div className={mobile ? null : this.props.classes.mainPage}>
                <div className={this.props.classes.appBarSpacer}/>

                {mobile ?
                    <SwipeableViews
                        index={Math.max(0, Object.keys(this.props.polls).length - 1)}
                    >
                        {Object.values(this.props.polls).map((poll, index) => {
                            return (
                                <InstructorPoll
                                    key={poll.pollID}
                                    index={index + 1}
                                    poll={poll}
                                    course={this.props.courses[this.props.match.params.courseID]}
                                />
                            )
                        })}
                    </SwipeableViews>
                    :
                    <Container maxWidth="md">
                        {Object.values(this.props.polls).reverse().map((poll, index) => {
                            index = Object.values(this.props.polls).length - index;
                            return (
                                <InstructorPoll
                                    key={poll.pollID}
                                    index={index}
                                    poll={poll}
                                    course={this.props.courses[this.props.match.params.courseID]}
                                />
                            )
                        })}
                    </Container>
                }
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return state;
};

const mapDispatchToProps = (dispatch) => {
    return {
        changePolls: (data) => dispatch(changePolls(data)),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withRouter(withStyles(styles, {withTheme: true})(withWidth()(InstructorPolls))));
