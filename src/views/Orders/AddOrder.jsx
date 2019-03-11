import React from 'react';
import Check from '@material-ui/icons/Check';
import Add from '@material-ui/icons/Add';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';
import PropTypes from 'prop-types';
import GridItem from '../../components/Grid/GridItem';
import GridContainer from '../../components/Grid/GridContainer';
import Button from '../../components/CustomButtons/Button';
import Card from '../../components/Card/Card';
import CardHeader from '../../components/Card/CardHeader';
import CardBody from '../../components/Card/CardBody';
import CardFooter from '../../components/Card/CardFooter';
import CustomInput from '../../components/CustomInput/CustomInput';
import Snackbar from '../../components/Snackbar/Snackbar';
import ProductSearch from './ProductSearch';
import CustomerSearch from './CustomerSearch';
import OrderTable from './OrderTable';
import OrderService from '../../services/OrderService';
import TaxService from '../../services/TaxService';
import UserService from '../../services/UserService';
import Location from '../../stores/Location';
import AuthStore from '../../stores/Auth';

const styles = {
  cardCategoryWhite: {
    color: 'rgba(255,255,255,.62)',
    margin: '0',
    fontSize: '14px',
    marginTop: '0',
    marginBottom: '0',
  },
  cardTitleWhite: {
    color: '#FFFFFF',
    marginTop: '0px',
    minHeight: 'auto',
    fontWeight: '300',
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    marginBottom: '3px',
    textDecoration: 'none',
  },
  smallText: {
    width: '100px',
  },
};

function priceRow(qty, unit) {
  return qty * unit;
}

function createRow(productId, productName, salesPrice) {
  const qty = 1;
  const discountPercent = 0;
  const discountAmount = 0;
  const discountType = 'percent';

  const price = priceRow(qty, salesPrice);
  const total = qty * price;
  return {
    productId,
    productName,
    qty,
    salesPrice,
    price,
    discountPercent,
    discountAmount,
    discountType,
    total,
  };
}

export default class AddOrder extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      customer: null,
      rows: [],
      discountPercent: 0.00,
      discountAmount: 0.00,
      notes: '',
      poNumber: '',
      taxes: [],
      allTaxes: [],
      openSnackbar: false,
      chargePst: true,
      openDialog: false,
      userGivenName: '',
      chequeNo: '',
      payCreditDebit: true,
      creditDebitAmount: 0,
      cashAmount: 0,
      chequeAmount: 0,
      paypalAmazonUsdAmount: 0,
      cashPaid: 0,
      cashChange: 0,
    };

    this.productChanged = this.productChanged.bind(this);
    this.priceChanged = this.priceChanged.bind(this);
    this.productRemoved = this.productRemoved.bind(this);
    this.customerChanged = this.customerChanged.bind(this);
    this.clearCustomer = this.clearCustomer.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleCashChange = this.handleCashChange.bind(this);
    this.saveAsPaid = this.saveAsPaid.bind(this);
    this.saveAsDraft = this.saveAsDraft.bind(this);
    this.saveAsHold = this.saveAsHold.bind(this);
    this.saveAsAccount = this.saveAsAccount.bind(this);
    this.handleCheckChange = this.handleCheckChange.bind(this);
    this.handlePstCheckChange = this.handlePstCheckChange.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.pay = this.pay.bind(this);
    this.handleAuthUpdate = this.handleAuthUpdate.bind(this);
    this.handleAuthEnter = this.handleAuthEnter.bind(this);
    this.newCustomer = this.newCustomer.bind(this);
  }

  async componentDidMount() {
    const taxes = await TaxService.getTaxes('Canada', 'BC');
    this.setState({
      taxes,
      allTaxes: taxes,
      chargePst: true,
      openDialog: false,
      openAuthDialog: true,
      userGivenName: '',
      chequeNo: '',
    });
  }

  getOrderPayments() {
    const {
      payCash, payCreditDebit, payCheque, payAmazonUsd,
      cashAmount, creditDebitAmount, chequeAmount, paypalAmazonUsdAmount,
      chequeNo,
    } = this.state;

    const orderPayments = [];
    if (payCash) {
      orderPayments.push({
        paymentTypeId: 22,
        paymentAmount: cashAmount,
      });
    }
    if (payCreditDebit) {
      orderPayments.push({
        paymentTypeId: 23,
        paymentAmount: creditDebitAmount,
      });
    }
    if (payCheque) {
      orderPayments.push({
        paymentTypeId: 24,
        paymentAmount: chequeAmount,
        chequeNo,
      });
    }
    if (payAmazonUsd) {
      orderPayments.push({
        paymentTypeId: 25,
        paymentAmount: paypalAmazonUsdAmount,
      });
    }
    return orderPayments;
  }

  handleClose = () => {
    this.setState({
      openDialog: false,
    });
  }

  newCustomer() {
    const { history } = this.props;
    return history.push('newcustomer');
  }

  async handleAuthEnter(event) {
    if (event.key === 'Enter') {
      await this.handleAuthUpdate();
    }
  }

  async handleAuthUpdate() {
    const { authCode } = this.state;
    const { permissionsChanged } = this.props;

    const result = await UserService.getUserByAuthCode(authCode);
    if (result === false
        || result === ''
        || result === null
        || result.StatusCode === 500
        || result.StatusCode === 400
        || result.StatusCode === 404) {
      this.setState({
        openSnackbar: true,
        snackbarMessage: 'Invalid Auth Code!',
        snackbarColor: 'danger',
      });
      return false;
    }

    AuthStore.setUserPermissions(result.permissions);
    this.setState({
      openAuthDialog: false,
      userGivenName: result.user.givenName,
    });
    permissionsChanged();
  }

  updateTaxes(customer, chargePst) {
    const { allTaxes } = this.state;
    // removing taxes with name like "pst" from the list
    // if the selected customer has PST number in their profile
    if (customer && customer.pstNumber && !chargePst) {
      const filterTaxes = allTaxes.reduce((filterTaxes, tax) => {
        if (!tax.taxName.toLowerCase().includes('pst')) {
          filterTaxes.push(tax);
        }
        return filterTaxes;
      }, []);

      this.setState({
        taxes: filterTaxes,
      });
      this.setState({
        openSnackbar: true,
        snackbarMessage: 'PST Tax not charged for this customer!',
        snackbarColor: 'warning',
      });
    } else {
      this.setState({
        taxes: allTaxes,
      });
    }
  }

  customerChanged(customer) {
    const { chargePst } = this.state;
    this.updateTaxes(customer, chargePst);
    this.setState({
      customer,
    });
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleCashChange(event) {
    const { cashAmount } = this.state;
    const cashPaid = event.target.value;
    let cashChange = 0;
    if (event.target.value && cashAmount) {
      cashChange = Number(Number(cashPaid).toFixed(2) - Number(cashAmount).toFixed(2)).toFixed(2);
    }

    this.setState({
      cashPaid,
      cashChange,
    });
  }

  handleCheckChange(event) {
    const {
      total, cashAmount, creditDebitAmount, chequeAmount, paypalAmazonUsdAmount,
    } = this.state;
    const paymentAmount = (
      Number(cashAmount)
      + Number(creditDebitAmount)
      + Number(chequeAmount)
      + Number(paypalAmazonUsdAmount)).toFixed(2);

    const remain = (total - paymentAmount).toFixed(2);
    this.setState({ [event.target.name]: event.target.checked });
    if (event.target.checked) {
      if (event.target.name === 'payCash') {
        this.setState({ cashAmount: remain });
      } else if (event.target.name === 'payCreditDebit') {
        this.setState({ creditDebitAmount: remain });
      } else if (event.target.name === 'payCheque') {
        this.setState({ chequeAmount: remain });
      } else if (event.target.name === 'payAmazonUsd') {
        this.setState({ paypalAmazonUsdAmount: remain });
      }
    } else if (event.target.name === 'payCash') {
      this.setState({ cashAmount: 0 });
    } else if (event.target.name === 'payCreditDebit') {
      this.setState({ creditDebitAmount: 0 });
    } else if (event.target.name === 'payCheque') {
      this.setState({ chequeAmount: 0 });
    } else if (event.target.name === 'payAmazonUsd') {
      this.setState({ paypalAmazonUsdAmount: 0 });
    }
  }

  handlePstCheckChange(event) {
    this.setState({ chargePst: event.target.checked });
    const { customer } = this.state;
    this.updateTaxes(customer, event.target.checked);
  }

  orderExceedsCustomerCredit() {
    const { customer, total } = this.state;
    if (customer
      && customer.creditLimit
      && customer.creditLimit > customer.accountBalance + total) {
      return false;
    }

    return true;
  }

  async saveOrder(orderStatus) {
    const {
      customer, rows, total, subTotal, notes, taxes, poNumber, authCode,
    } = this.state;
    const status = orderStatus;
    const orderDetails = rows.map(row => (
      {
        orderId: 0,
        orderDetailId: 0,
        productId: row.productId,
        amount: row.qty,
        unitPrice: row.salesPrice,
        discountPercent: row.discountPercent,
        discountAmount: row.discountAmount,
        discountType: row.discountType,
        subTotal: row.total,
        totalDiscount: (row.discountType === 'percent' ? (row.discountPercent / 100) * row.total : row.discountAmount),
        total: row.total - (row.discountType === 'percent' ? (row.discountPercent / 100) * row.total : row.discountAmount),
      }));
    const orderTaxes = taxes.map(tax => (
      {
        taxId: tax.taxId,
        taxAmount: (tax.percentage / 100) * subTotal,
      }));

    let orderPayment = [];
    if (orderStatus === 'Paid') {
      orderPayment = this.getOrderPayments();
    }

    const order = {
      locationId: Location.getStoreLocation(),
      subTotal,
      total,
      customerId: customer !== null ? customer.customerId : null,
      status,
      notes,
      poNumber,
      pstNumber: customer !== null ? customer.pstNumber : null,
      orderTax: orderTaxes,
      orderDetail: orderDetails,
      authCode,
      orderPayment,
    };

    const result = await OrderService.saveOrder(order);
    if (result === false
        || result === null
        || result.StatusCode === 500
        || result.StatusCode === 400) {
      this.setState({
        openSnackbar: true,
        snackbarMessage: 'Oops, looks like something went wrong!',
        snackbarColor: 'danger',
      });
      return false;
    }
    return result;
  }

  async pay() {
    const {
      total, cashAmount, creditDebitAmount, chequeAmount, paypalAmazonUsdAmount,
    } = this.state;

    const paidAmount = Number(cashAmount)
      + Number(creditDebitAmount)
      + Number(chequeAmount)
      + Number(paypalAmazonUsdAmount);

    if ((Number(paidAmount)).toFixed(2) !== (Number(total)).toFixed(2)) {
      this.setState({
        openSnackbar: true,
        snackbarMessage: `Total Paid Amount: ${paidAmount.toFixed(2)} $, must be the same as Order Total:${total.toFixed(2)} $`,
        snackbarColor: 'danger',
      });
      return;
    }

    const { history } = this.props;
    const result = await this.saveOrder('Paid');
    if (result && result.orderId) {
      this.setState({
        openSnackbar: true,
        snackbarMessage: 'Order was Saved and marked as Paid successfully!',
        snackbarColor: 'success',
      });
      history.push(`/order/${result.orderId}`);
    }
  }

  async saveAsPaid() {
    const { total } = this.state;
    this.setState({
      openDialog: true,
      creditDebitAmount: total.toFixed(2),
    });
  }

  clearCustomer() {
    this.setState({ customer: null });
  }

  priceChanged(subTotal, total) {
    this.setState({
      subTotal,
      total,
    });
  }

  productRemoved(productId) {
    const { rows } = this.state;
    this.setState({
      rows: rows.filter(row => row.productId !== productId),
    });
  }

  productChanged(product) {
    const { rows } = this.state;
    const newRows = JSON.parse(JSON.stringify(rows));
    const foundProduct = newRows.find(row => row.productId === product.productId);
    if (foundProduct) {
      foundProduct.qty = Number(foundProduct.qty) + 1;
      foundProduct.total = foundProduct.qty * foundProduct.price;
      this.setState({ rows: newRows });
    } else {
      const newRow = createRow(product.productId, product.productName, product.salesPrice);
      this.setState(prevState => ({
        rows: [...prevState.rows, newRow],
      }));
    }
  }

  async saveAsDraft() {
    const result = await this.saveOrder('Draft');
    const { history } = this.props;
    if (result && result.orderId) {
      this.setState({
        openSnackbar: true,
        snackbarMessage: 'Order was Saved as Draft successfully!',
        snackbarColor: 'warning',
      });
      history.push(`/order/${result.orderId}`);
    }
  }

  async saveAsHold() {
    const result = await this.saveOrder('OnHold');
    const { history } = this.props;
    if (result && result.orderId) {
      this.setState({
        openSnackbar: true,
        snackbarMessage: 'Order was Saved and marked as On Hold successfully!',
        snackbarColor: 'warning',
      });
      history.push(`/order/${result.orderId}`);
    }
  }

  async saveAsAccount() {
    if (this.orderExceedsCustomerCredit()) {
      this.setState({
        openSnackbar: true,
        snackbarMessage: 'Customer is exceeding the credit limit!',
        snackbarColor: 'danger',
      });
      return;
    }

    const result = await this.saveOrder('Account');
    const { history } = this.props;

    if (result && result.orderId) {
      this.setState({
        openSnackbar: true,
        snackbarMessage: "Order was Saved and Added to customer's Credit successfully!",
        snackbarColor: 'info',
      });
      history.push(`/order/${result.orderId}`);
    }
  }

  render() {
    const {
      rows,
      taxes,
      discountAmount,
      discountPercent,
      customer, openSnackbar, snackbarMessage, snackbarColor, notes, poNumber,
      chargePst,
      openDialog,
      openAuthDialog,
      total,
      authCode,
      userGivenName,
      chequeNo,
      payCash,
      payCheque,
      payCreditDebit,
      payAmazonUsd,
      cashAmount,
      chequeAmount,
      creditDebitAmount,
      paypalAmazonUsdAmount,
      cashChange,
      cashPaid,
    } = this.state;

    return (
      <div>
        <GridContainer>
          <GridItem xs={12} sm={12} md={12}>
            <Card>
              <CardHeader color="primary">
                <div className={styles.cardTitleWhite}>
                  <b>New Order</b>
                  - User:
                  {authCode}
                  -
                  {userGivenName}
                </div>
              </CardHeader>
              <CardBody>
                <GridContainer>
                  <GridItem xs={12} sm={12} md={9}>
                    <CustomerSearch customerChanged={this.customerChanged} />
                  </GridItem>
                  <GridItem xs={12} sm={12} md={3}>
                    <Button color="primary" onClick={this.newCustomer}>
                      <Add />
                      New Customer
                    </Button>
                  </GridItem>
                </GridContainer>
                { customer ? (
                  <GridContainer>
                    <GridItem xs={12} sm={12} md={12}>
                      <Card>
                        <CardBody>
                          <GridContainer>
                            <GridItem xs={12} sm={12} md={3}>
                              <CustomInput
                                labelText="Full Name"
                                formControlProps={{
                                  fullWidth: true,
                                }}
                                inputProps={{
                                  disabled: true,
                                  value: `${customer.firstName} ${customer.firstName}`,
                                }}
                              />
                            </GridItem>
                            <GridItem xs={12} sm={12} md={3}>
                              <CustomInput
                                labelText="User Name"
                                formControlProps={{
                                  fullWidth: true,
                                }}
                                inputProps={{
                                  disabled: true,
                                  value: `${customer.userName} `,
                                }}
                              />
                            </GridItem>
                            <GridItem xs={12} sm={12} md={3}>
                              <CustomInput
                                labelText="Email"
                                formControlProps={{
                                  fullWidth: true,
                                }}
                                inputProps={{
                                  disabled: true,
                                  value: `${customer.userName} `,
                                }}
                              />
                            </GridItem>
                            <GridItem xs={12} sm={12} md={3}>
                              <CustomInput
                                labelText="Phone Number"
                                formControlProps={{
                                  fullWidth: true,
                                }}
                                inputProps={{
                                  disabled: true,
                                  value: `${customer.phoneNumber} `,
                                }}
                              />
                            </GridItem>
                          </GridContainer>
                          <GridContainer alignItems="flex-end">
                            <GridItem xs={12} sm={12} md={3}>
                              <CustomInput
                                labelText="Credit Limit"
                                formControlProps={{
                                  fullWidth: true,
                                }}
                                inputProps={{
                                  disabled: true,
                                  value: `${customer.creditLimit} $`,
                                  error: 'error',
                                }}
                              />
                            </GridItem>
                            <GridItem xs={12} sm={12} md={3}>
                              <CustomInput
                                labelText="Unpaid Orders Amount"
                                formControlProps={{
                                  fullWidth: true,
                                }}
                                inputProps={{
                                  disabled: true,
                                  value: `${customer.accountBalance} $`,
                                  error: 'error',
                                }}
                              />
                            </GridItem>
                            <GridItem xs={12} sm={12} md={3}>
                              <CustomInput
                                labelText="PST Number"
                                formControlProps={{
                                  fullWidth: true,
                                }}
                                inputProps={{
                                  disabled: true,
                                  value: customer.pstNumber === null ? 'Not Provided' : `${customer.pstNumber} `,
                                }}
                              />
                              <FormControlLabel
                                control={(
                                  <Checkbox
                                    checked={chargePst}
                                    onChange={this.handlePstCheckChange}
                                    value="chargePst"
                                  />
                                )}
                                label="Charge PST"
                              />
                            </GridItem>
                            <GridItem xs={12} sm={12} md={3}>
                              <Button color="info" onClick={this.clearCustomer}>Clear</Button>
                            </GridItem>
                          </GridContainer>
                        </CardBody>
                      </Card>
                    </GridItem>
                  </GridContainer>
                ) : (<div />)
                }
                <GridContainer>
                  <GridItem xs={12} sm={12} md={12}>
                    <ProductSearch productChanged={this.productChanged} />
                  </GridItem>
                  <GridItem xs={12} sm={12} md={3}>
                    {/* <Button color="primary" onClick={this.newCustomer}>Product List</Button> */}
                  </GridItem>
                </GridContainer>
                <GridContainer>
                  <GridItem xs={12} sm={12} md={12}>
                    <OrderTable
                      rows={rows}
                      taxes={taxes}
                      discountAmount={discountAmount}
                      discountPercent={discountPercent}
                      priceChanged={this.priceChanged}
                      productRemoved={this.productRemoved}
                    />
                  </GridItem>
                </GridContainer>
                <GridContainer>
                  <GridItem xs={12} sm={12} md={3}>
                    <CustomInput
                      labelText="PO Number"
                      formControlProps={{
                        fullWidth: true,
                      }}
                      inputProps={{
                        value: poNumber,
                        name: 'poNumber',
                        onChange: this.handleChange,
                      }}
                    />
                  </GridItem>
                  <GridItem xs={12} sm={12} md={9}>
                    <CustomInput
                      labelText="Notes"
                      formControlProps={{
                        fullWidth: true,
                      }}
                      inputProps={{
                        multiline: true,
                        rows: 1,
                        value: notes,
                        name: 'notes',
                        onChange: this.handleChange,
                      }}
                    />
                  </GridItem>
                </GridContainer>
              </CardBody>
              <CardFooter>
                <GridContainer>
                  <GridItem xs>
                    <Button color="primary" onClick={this.saveAsPaid}>Mark As Paid</Button>
                  </GridItem>
                  <GridItem xs>
                    <Button color="info" onClick={this.saveAsDraft}>Save As Draft</Button>
                  </GridItem>
                  { customer && customer.creditLimit > 0 ? (
                    <GridItem xs>
                      <Button color="info" onClick={this.saveAsAccount}>Use Customers Account</Button>
                    </GridItem>
                  ) : (<div />)
                  }
                  { customer ? (
                    <GridItem xs>
                      <Button color="info" onClick={this.saveAsHold}>Put On Hold</Button>
                    </GridItem>
                  ) : (<div />)
                  }
                </GridContainer>
              </CardFooter>
            </Card>
            <Snackbar
              place="tl"
              color={snackbarColor}
              icon={Check}
              message={snackbarMessage}
              open={openSnackbar}
              closeNotification={() => this.setState({ openSnackbar: false })}
              close
            />
          </GridItem>
        </GridContainer>
        <Dialog
          open={openDialog}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogContent>
            <Card>
              <CardHeader color="info">
                <div>Select Payment Option</div>
              </CardHeader>
              <CardBody>
                <FormControl component="fieldset">
                  <GridContainer md={12}>
                    <GridItem md={3}>
                      <FormControlLabel
                        control={(
                          <Checkbox
                            name="payCash"
                            checked={payCash}
                            onChange={this.handleCheckChange}
                            value="payCash"
                          />
                        )}
                        label="Cash"
                      />
                    </GridItem>
                    <GridItem md={3}>
                      <TextField
                        disabled={!payCash}
                        name="cashAmount"
                        label="Cash Amount"
                        type="text"
                        onChange={this.handleChange}
                        style={styles.smallText}
                        value={cashAmount}
                      />
                    </GridItem>
                    <GridItem md={3}>
                      <TextField
                        disabled={!payCash}
                        name="cashPaid"
                        label="Bills Paid"
                        type="text"
                        onChange={this.handleCashChange}
                        style={styles.smallText}
                        value={cashPaid}
                      />
                    </GridItem>
                    <GridItem md={3}>
                      <TextField
                        disabled
                        name="cashChange"
                        label="Change"
                        type="text"
                        style={styles.smallText}
                        value={cashChange}
                      />
                    </GridItem>
                    <GridItem md={6}>
                      <FormControlLabel
                        control={(
                          <Checkbox
                            checked={payCreditDebit}
                            onChange={this.handleCheckChange}
                            name="payCreditDebit"
                            value="payCreditDebit"
                          />
                        )}
                        label="Credit Card / Debit"
                      />
                    </GridItem>
                    <GridItem md={6}>
                      <TextField
                        disabled={!payCreditDebit}
                        name="creditDebitAmount"
                        label="Credit/Debit Amount"
                        type="text"
                        onChange={this.handleChange}
                        value={creditDebitAmount}
                      />
                    </GridItem>
                    <GridItem md={6}>
                      <FormControlLabel
                        control={(
                          <Checkbox
                            checked={payCheque}
                            onChange={this.handleCheckChange}
                            value="payCheque"
                            name="payCheque"
                          />
                        )}
                        label="Cheque"
                      />
                      {payCheque && (
                        <TextField
                          name="chequeNo"
                          label="Cheque Number"
                          type="text"
                          onChange={this.handleChange}
                          value={chequeNo}
                        />
                      )}
                    </GridItem>
                    <GridItem md={6}>
                      <TextField
                        disabled={!payCheque}
                        name="chequeAmount"
                        label="Cheque Amount"
                        type="text"
                        onChange={this.handleChange}
                        value={chequeAmount}
                      />
                    </GridItem>
                    <GridItem md={6}>
                      <FormControlLabel
                        control={(
                          <Checkbox
                            checked={payAmazonUsd}
                            onChange={this.handleCheckChange}
                            value="payAmazonUsd"
                            name="payAmazonUsd"
                          />
                        )}
                        label="Paypal and Amazon + USD"
                      />
                    </GridItem>
                    <GridItem md={6}>
                      <TextField
                        disabled={!payAmazonUsd}
                        name="paypalAmazonUsdAmount"
                        label="Paypal/Amazon/USD"
                        type="text"
                        onChange={this.handleChange}
                        value={paypalAmazonUsdAmount}
                      />
                    </GridItem>
                    <GridItem md={12}>
                      <br />
                      <hr />
                    </GridItem>
                    <GridItem md={6}>
                      <h5>Total Payment:</h5>
                    </GridItem>
                    <GridItem md={6}>
                      <h5>
                        {(Number(cashAmount)
                          + Number(creditDebitAmount)
                          + Number(chequeAmount)
                          + Number(paypalAmazonUsdAmount)).toFixed(2)}
                        {' '}
                        $
                      </h5>
                    </GridItem>
                    <GridItem md={6}>
                      <h5>Amount Due:</h5>
                    </GridItem>
                    <GridItem md={6}>
                      <h5>
                        { total && total.toFixed(2) }
                        {' '}
$
                      </h5>
                    </GridItem>
                  </GridContainer>
                </FormControl>
              </CardBody>
            </Card>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="info">
              Cancel
            </Button>
            <Button onClick={this.pay} color="primary">
              Pay
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={openAuthDialog}
          // onClose={this.handleAuthClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogContent>
            <Card>
              <CardHeader color="info">
                <div>Pass Code</div>
              </CardHeader>
              <CardBody>
                <TextField
                  name="authCode"
                  label="Auth Code"
                  type="text"
                  autoFocus
                  onChange={this.handleChange}
                  onKeyPress={this.handleAuthEnter}
                  value={authCode}
                />
              </CardBody>
            </Card>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleAuthUpdate} color="primary">
              Ok
            </Button>
          </DialogActions>
        </Dialog>

      </div>
    );
  }
}

AddOrder.propTypes = {
  history: PropTypes.func.isRequired,
};
