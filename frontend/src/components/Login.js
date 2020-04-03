import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from "react-router-dom";

import withStyles from '@material-ui/core/styles/withStyles';
import withWidth from "@material-ui/core/withWidth/withWidth";
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Snackbar from "@material-ui/core/Snackbar";

import {changeAccount} from './../redux';
import {anonymousSignIn, signIn, signUp} from './../firebaseApi';
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";

const styles = theme => ({
    paper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: theme.spacing(2),
        marginTop: theme.spacing(10),
        [theme.breakpoints.up(400 + theme.spacing(3 * 2))]: {
            width: 400,
            marginLeft: 'auto',
            marginRight: 'auto',
        },
    },
    button: {
        marginTop: theme.spacing(3),
    },
});

class Login extends Component {
    constructor(props) {
        super(props);
        //console.log("Login props", this.props);

        this.state = {
            tab: 0,

            email: '',
            password: '',
            repeatPassword: '',
            name: '',
            note: '',
            type: 'student',

            accountError: '',
            emailError: '',
            passwordError: '',
            repeatPasswordError: '',
            nameError: '',
        };
    }

    render() {
        return(
            <div>
                <Snackbar
                    anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "left",
                    }}
                    open={this.state.accountError !== ''}
                    autoHideDuration={6000}
                    onClose={() => {
                        this.setState({accountError: ''});
                    }}
                    message={<span>{this.state.accountError}</span>}
                />

                <Paper className={this.props.classes.paper}>
                    <Tabs
                        value={this.state.tab}
                        centered
                        onChange={(event, newValue) => {
                            this.setState({
                                tab: newValue,

                                email: '',
                                password: '',
                                repeatPassword: '',
                                name: '',
                                note: '',
                                type: 'student',

                                accountError: '',
                                emailError: '',
                                passwordError: '',
                                repeatPasswordError: '',
                                nameError: '',
                            })
                        }}
                    >
                        <Tab label="Sign In" />
                        <Tab label="Sign Up" />
                    </Tabs>

                    <TextField
                        fullWidth
                        margin="normal"
                        type="email"
                        label="UCSD Email"
                        value={this.state.email}
                        error={this.state.emailError.length !== 0}
                        helperText={this.state.emailError}
                        onChange={(event) => {
                            this.setState({
                                email: event.target.value,
                                emailError: '',
                            });
                        }}
                    />

                    <TextField
                        fullWidth
                        margin="normal"
                        type="password"
                        label="Password"
                        value={this.state.password}
                        error={this.state.passwordError.length !== 0}
                        helperText={this.state.passwordError}
                        onChange={(event) => {
                            this.setState({
                                password: event.target.value,
                                passwordError: '',
                                repeatPasswordError: '',
                            });
                        }}
                    />

                    {this.state.tab === 0 ? null :
                        <div>
                            <TextField
                                fullWidth
                                margin="normal"
                                type="password"
                                label="Repeat password"
                                error={this.state.repeatPasswordError.length !== 0}
                                helperText={this.state.repeatPasswordError}
                                onChange={(event) => {
                                    this.setState({
                                        repeatPassword: event.target.value,
                                        repeatPasswordError: '',
                                    });
                                }}
                            />

                            <TextField
                                fullWidth
                                margin="normal"
                                label="Name"
                                error={this.state.nameError.length !== 0}
                                helperText={this.state.nameError}
                                onChange={(event) => {
                                    this.setState({
                                        name: event.target.value,
                                        nameError: '',
                                    });
                                }}
                            />

                            <TextField
                                fullWidth
                                multiline
                                margin="normal"
                                label="Note"
                                helperText="Please provide necessary information for us to verify your identity"
                                onChange={(event) => {
                                    this.setState({
                                        note: event.target.value,
                                    });
                                }}
                            />

                            <FormControl
                                fullWidth
                                margin="normal"
                            >
                                <InputLabel>Choose Identity</InputLabel>
                                <Select
                                    value={this.state.type}
                                    onChange={event => {
                                        this.setState({
                                            type: event.target.value,
                                        });
                                    }}
                                >
                                    {['instructor', 'student'].map(type => (
                                        <MenuItem
                                            button={true}
                                            key={type}
                                            value={type}
                                        >
                                            {type}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </div>
                    }

                    <Button
                        className={this.props.classes.button}
                        fullWidth
                        variant="outlined"
                        onClick={() => {
                            if(this.state.email === '') {
                                this.setState({emailError: 'Email cannot be empty'})
                            }
                            else if(this.state.password === '') {
                                this.setState({passwordError: 'Password cannot be empty'})
                            }
                            else {
                                if (this.state.tab === 0) {
                                    let data = {
                                        email: this.state.email,
                                        password: this.state.password,
                                    };

                                    signIn(data).then(data => {
                                        this.props.changeAccount(data);
                                        this.props.history.push('/loading');
                                    }).catch(err => {
                                        this.setState(err);
                                    });
                                }
                                else {
                                    if(this.state.password !== this.state.repeatPassword) {
                                        this.setState({repeatPasswordError: 'Password mismatch',})
                                    }
                                    else if(this.state.name === '') {
                                        this.setState({nameError: 'Name cannot be empty',})
                                    }
                                    else {
                                        let data = {
                                            email: this.state.email,
                                            password: this.state.password,
                                            name: this.state.name,
                                            note: this.state.note,
                                            type: this.state.type,
                                        };

                                        signUp(data).then(data => {
                                            this.props.changeAccount(data);
                                            this.props.history.push('/loading');
                                        }).catch(err => {
                                            this.setState(err);
                                        });
                                    }
                                }
                            }

                        }}
                    >
                        {this.state.tab === 0 ? "Sign in" : "Sign Up"}
                    </Button>

                    <Button
                        className={this.props.classes.button}
                        fullWidth
                        variant="outlined"
                        onClick={() => {
                            anonymousSignIn().then(data => {
                                this.props.changeAccount(data);
                                this.props.history.push('/loading');
                            })
                        }}
                    >
                        Vote Anonymously
                    </Button>

                </Paper>
            </div>
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
)(withRouter(withStyles(styles, {withTheme: true})(withWidth()(Login))));
