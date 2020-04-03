import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Route, Switch, withRouter} from "react-router-dom";

import Login from './Login';
import Instructor from './Instructor';
import Student from "./Student";
import {listenAuthorization} from "../firebaseApi";
import {changeAccount} from "../redux";

class Router extends Component {
    constructor(props) {
        super(props);
        //console.log("Router Constructor", this.props);

        listenAuthorization().then((data) => {
            this.props.changeAccount(data);
            this.props.history.push('/loading');
        });

        this.checkPermission();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        //console.log('Router: componentDidMount', this.props);
        if (this.props.match.params.user !== prevProps.match.params.user) {
            this.checkPermission();
        }
    }

    checkPermission() {
        switch(this.props.account.accountType) {
            case 'instructor':
                this.props.history.push('/instructor/');
                break;
            case 'student':
                this.props.history.push('/student/');
                break;
            default:
                this.props.history.push('/login/');
        }
    }

    render() {
        return (
            <Switch>
                <Route path='/login' component={Login}/>
                <Route path='/instructor/' component={Instructor}/>
                <Route path='/student/' component={Student}/>
            </Switch>
        );
    }
}

const mapStateToProps = (state) => {
    return state;
};

const mapDispatchToProps = (dispatch) => {
    return {
        changeAccount: (data) => dispatch(changeAccount(data)),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withRouter(Router));
