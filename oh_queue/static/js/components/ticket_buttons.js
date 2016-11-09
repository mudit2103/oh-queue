class TicketButtons extends React.Component {
  constructor(props) {
    super(props);
    this.assign = this.assign.bind(this);
    this.delete = this.delete.bind(this);
    this.resolveAndNext = this.resolveAndNext.bind(this);
    this.resolve = this.resolve.bind(this);
    this.unassign = this.unassign.bind(this);
    this.reassign = this.reassign.bind(this);
    this.next = this.next.bind(this);
  }

  assign() {
    let ticket = this.props.ticket;
    app.makeRequest('assign', ticket.id);
    if (ticket.location === "Online" && ticket.online_url) {

          swal({
            title: 'Online Help Session',
            text: "Go to " + ticket.online_url + " to help your student",
            type: 'info',
            showCancelButton: false,
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Go to session',
            confirmButtonClass: 'btn btn-success',
            buttonsStyling: false
          }).then(function() {
            var win = window.open(ticket.online_url, '_blank');
            win.focus();
          }, function(dismiss) {
            // dismiss can be 'cancel', 'overlay',
            // 'close', and 'timer'
          })
    }
  }

  delete() {
    if (!confirm("Delete this ticket?")) return;
    app.makeRequest('delete', this.props.ticket.id);
  }

  resolveAndNext() {
    app.makeRequest('resolve', this.props.ticket.id, true)
  }

  resolve() {
    app.makeRequest('resolve', this.props.ticket.id);
  }

  unassign() {
    app.makeRequest('unassign', this.props.ticket.id);
  }

  reassign() {
    if (!confirm("Reassign this ticket?")) return;
    app.makeRequest('assign', this.props.ticket.id);
  }

  next() {
    app.makeRequest('next', this.props.ticket.id, true);
  }

  render() {
    let {state, ticket} = this.props;
    let staff = isStaff(state);

    function makeButton(text, style, action) {
      return (
        <button onClick={action}
          className={`btn btn-${style} btn-lg btn-block`}>
          {text}
        </button>
      );
    }

    function makeLink(text, style, href) {
      return (
        <a href={href} target="_blank"
          className={`btn btn-${style} btn-lg btn-block`}>
          {text}
        </a>
      );
    }

    let preButtons = [];
    let topButtons = [];
    let bottomButtons = [];

    if (ticket.status === 'pending') {
      bottomButtons.push(makeButton('Delete', 'danger', this.delete));
      if (staff) {
        topButtons.push(makeButton('Help', 'primary', this.assign));
      }
    }
    if (!staff && ticket.location == "Online") {
      preButtons.push(makeLink("Online Session", 'primary', ticket.online_url))
    }

    if (ticket.status === 'assigned') {
      bottomButtons.push(makeButton('Resolve', 'default', this.resolve));
      if (staff) {
        if (ticket.location == "Online") {
          preButtons.push(makeLink("Online Session", 'primary', ticket.online_url))
        }

        if (ticket.helper.id === state.currentUser.id) {
          topButtons.push(makeButton('Resolve and Next', 'primary', this.resolveAndNext));
          bottomButtons.push(makeButton('Requeue', 'default', this.unassign));
        } else {
          topButtons.push(makeButton('Reassign', 'warning', this.reassign));
          topButtons.push(makeButton('Next Ticket', 'default', this.next));
        }
      }
    }
    if (staff && (ticket.status === 'resolved' || ticket.status === 'deleted')) {
      topButtons.push(makeButton('Next Ticket', 'default', this.next));
    }

    let hr = topButtons.length && bottomButtons.length ? <hr/> : null;

    if (ticket.status === 'deleted' && !staff) {
      return null;
    }
    if (!(topButtons.length || bottomButtons.length || preButtons.length)) {
      return null;
    }

    return (
      <div className="row">
        {preButtons.length !== 0 &&
          <div className="col-xs-12 col-sm-6 col-sm-offset-3 col-md-4 col-md-offset-4">
            <div className="well">
              {preButtons}
            </div>
          </div>
        }

        <div className="col-xs-12 col-sm-6 col-sm-offset-3 col-md-4 col-md-offset-4">
          <div className="well">
            {topButtons}
            {hr}
            {bottomButtons}
          </div>
        </div>
      </div>
    );
  }
}
