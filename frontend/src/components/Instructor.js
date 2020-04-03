import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {Redirect, Route, Switch, withRouter} from "react-router-dom";

import {withStyles} from "@material-ui/core";
import withWidth from "@material-ui/core/withWidth/withWidth";

import InstructorTopBar from "./InstructorTopBar";
import InstructorMenu from "./InstructorMenu";
import InstructorSessions from "./InstructorSessions";
import InstructorPolls from "./InstructorPolls";

const styles = theme => {

};

class Instructor extends Component {
    constructor(props) {
        super(props);
        //console.log("Instructor Constructor", this.props);

        this.state = {
            userMenuOpen: true,
            sessionMenuOpen: true,
        };
    }

    componentDidMount() {
        //console.log('Instructor: componentDidMount', this.props);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        //console.log('Instructor: componentDidUpdate', prevProps, this.props);
    }

    componentWillUnmount() {
        //console.log('Instructor: componentWillUnmount');
    }

    render() {
        return (
            <Fragment>
                <Route
                    path="/instructor/:courseID?/:sessionID?"
                    render={() =>
                        <InstructorTopBar
                            userMenuOpen={this.state.userMenuOpen}
                            userMenuOpenCtl={(open) => {this.setState({userMenuOpen: open})}}
                            sessionMenuOpen={this.state.sessionMenuOpen}
                            sessionMenuOpenCtl={(open) => {this.setState({sessionMenuOpen: open})}}
                        />
                    }
                />
                <Route
                    path="/instructor/:courseID?/:sessionID?"
                    render={() =>
                        <InstructorMenu
                            open={this.state.userMenuOpen}
                            openCtl={(open) => {this.setState({userMenuOpen: open})}}
                        />
                    }
                />
                <Route
                    path="/instructor/:courseID/:sessionID?"
                    render={() =>
                        <InstructorSessions
                            open={this.state.sessionMenuOpen}
                            openCtl={(open) => {this.setState({sessionMenuOpen: open})}}
                        />
                    }
                />
                <Route
                    path="/instructor/:courseID/:sessionID/"
                    render={() =>
                        <InstructorPolls
                            userMenuOpen={this.state.userMenuOpen}
                            userMenuOpenCtl={(open) => {this.setState({userMenuOpen: open})}}
                            sessionMenuOpen={this.state.sessionMenuOpen}
                            sessionMenuOpenCtl={(open) => {this.setState({sessionMenuOpen: open})}}
                        />
                    }
                />
            </Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    return state;
};

const mapDispatchToProps = (dispatch) => {
    return {
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withRouter(withStyles(styles, {withTheme: true})(withWidth()(Instructor))));

