import React, { Component } from 'react';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from "@material-ui/core/Typography";
import {Grid} from "@material-ui/core";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";

import windowsLogo from '../assets/windows_logo.png';
import appleLogo from '../assets/apple_logo.png';
import linuxLogo from '../assets/linux_logo.png';

const styles = theme => ({
    card: {
        width: 280,
    },
    cardMedia: {
        height: 140,
    },
});

class SnifferPage extends Component {
    constructor(props) {
        super(props);
        //console.log("CourseSettings props", this.props);

        this.state = {
            activeStep: 0,
            downloading: false,
        };

        this.newCourseFileRef = React.createRef();
    }

    render() {
        return (
            <div>
                <Dialog
                    disableBackdropClick
                    disableEscapeKeyDown
                    maxWidth={"md"}
                    fullWidth
                    open={this.props.open}
                    onClose={() => {
                        this.props.onClose();
                    }}
                >
                    <DialogTitle>
                        Download Iclicker Sniffer
                    </DialogTitle>

                    <DialogContent>
                        <Grid container direction="row" justify="space-evenly" alignItems="center">
                            <Grid item>
                                <Card className={this.props.classes.card}>
                                    <CardActionArea
                                        href="https://firebasestorage.googleapis.com/v0/b/iclicker-web-c0d76.appspot.com/o/development%2FSniffer-Win.zip?alt=media&token=0b858be7-e2b3-4f0d-a1f9-2d382f86da15"
                                    >
                                        <CardMedia
                                            className={this.props.classes.cardMedia}
                                            image={windowsLogo}
                                        />
                                        <CardContent>
                                            <Typography gutterBottom variant="h5" component="h2">
                                                Windows
                                            </Typography>
                                            <Typography variant="body2">
                                                Click to download Windows sniffer V1.1
                                            </Typography>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Grid>

                            <Grid item>
                                <Card className={this.props.classes.card}>
                                    <CardActionArea
                                    >
                                        <CardMedia
                                            className={this.props.classes.cardMedia}
                                            image={appleLogo}
                                        />
                                        <CardContent>
                                            <Typography gutterBottom variant="h5" component="h2">
                                                MacOs
                                            </Typography>
                                            <Typography variant="body2">
                                                MacOs platform is not supported yet
                                            </Typography>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Grid>

                            <Grid item>
                                <Card className={this.props.classes.card}>
                                    <CardActionArea
                                    >
                                        <CardMedia
                                            className={this.props.classes.cardMedia}
                                            image={linuxLogo}
                                        />
                                        <CardContent>
                                            <Typography gutterBottom variant="h5" component="h2">
                                                Linux
                                            </Typography>
                                            <Typography variant="body2">
                                                Linux platform is not supported yet
                                            </Typography>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions>
                    <Button
                        color="primary"
                        onClick={() => {
                            this.props.onClose();
                        }}
                    >
                        close
                    </Button>
                </DialogActions>
            </Dialog>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return state;
};

const mapDispatchToProps = (dispatch) => {
    return {
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles, { withTheme: true })(SnifferPage));
