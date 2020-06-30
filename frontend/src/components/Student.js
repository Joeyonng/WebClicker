import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {Route, withRouter} from "react-router-dom";

import {withStyles} from "@material-ui/core";
import withWidth from "@material-ui/core/withWidth/withWidth";

import StudentTopBar from './StudentTopBar';
import StudentMenu from './StudentMenu';
import StudentPolls from "./StudentPolls";
import Slides from "./Slides";

const styles = theme => ({
    appBarSpacer: theme.mixins.toolbar,
    grow: {
        flexGrow: 1,
    },
    bottomBar: {
        top: 'auto',
        bottom: 0,
    },
    accountListItem: {
        height: 64,
        width: 256,
    },
});

class Student extends Component {
    constructor(props) {
        super(props);
        //console.log("Student Constructor", this.props);

        this.state = {
            userMenuOpen: true,
        };
    }

    componentDidMount() {
        //console.log('Student: componentDidMount', this.props);

    }

    componentWillUnmount() {
        //console.log('Student: componentWillUnmount', this.props);
    }

   render() {
        let mobile = this.props.width === 'sm' || this.props.width === 'xs';

        return (
            <Fragment>
                <Route
                    path="/student/:courseID?/:pollID?"
                    render={() =>
                        <StudentTopBar
                            userMenuOpen={this.state.userMenuOpen}
                            userMenuOpenCtl={(open) => {this.setState({userMenuOpen: open})}}
                        />
                    }
                />
                <Route
                    path="/student/:courseID?/:pollID?"
                    render={() =>
                        <StudentMenu
                            open={this.state.userMenuOpen}
                            openCtl={(open) => {this.setState({userMenuOpen: open})}}
                        />
                    }
                />
                <Route
                    path="/student/:courseID/:pollID"
                    render={() =>
                        <StudentPolls
                            userMenuOpen={this.state.userMenuOpen}
                            userMenuOpenCtl={(open) => {this.setState({userMenuOpen: open})}}
                        />
                    }
                />
                <Route
                    path="/student/:courseID"
                    render={() =>
                        <Slides
                            userMenuOpen={this.state.userMenuOpen}
                            userMenuOpenCtl={(open) => {this.setState({userMenuOpen: open})}}
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
)(withRouter(withStyles(styles, {withTheme: true})(withWidth()(Student))));

