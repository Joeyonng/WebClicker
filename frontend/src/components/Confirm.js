import React from 'react';
import {connect} from 'react-redux';
import {withRouter} from "react-router-dom";

import {withStyles} from "@material-ui/core";
import withWidth from "@material-ui/core/withWidth/withWidth";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";

const styles = theme => {
};

class Confirm extends React.Component {
    constructor(props) {
        super(props);
        //console.log("Confirm props", this.props);

        this.state = {
        };
    }

    render() {
        return (
            <Dialog
                open={this.props.open}
                onClose={() => {this.props.openCtl(false)}}
            >
                <DialogTitle>{this.props.title}</DialogTitle>
                <DialogContent><DialogContentText>{this.props.content}</DialogContentText></DialogContent>
                <DialogActions>
                    <Button onClick={() => {this.props.openCtl(false)}}>Cancel</Button>
                    <Button onClick={() => {
                        this.props.confirm();
                        this.props.openCtl(false);
                    }}>OK</Button>
                </DialogActions>
            </Dialog>

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
)(withRouter(withStyles(styles, {withTheme: true})(withWidth()(Confirm))));

