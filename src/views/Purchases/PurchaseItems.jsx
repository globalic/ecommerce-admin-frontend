import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import TextField from '@material-ui/core/TextField';
import Check from '@material-ui/icons/Check';
import FormControl from '@material-ui/core/FormControl';
import Dialog from '@material-ui/core/Dialog';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import PrintIcon from '@material-ui/icons/Print';
import IconButton from '@material-ui/core/IconButton';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import MaterialTable from 'material-table';
import ReactToPrint from 'react-to-print';
import PropTypes from 'prop-types';
import Snackbar from '../../components/Snackbar/Snackbar';
import GridItem from '../../components/Grid/GridItem';
import GridContainer from '../../components/Grid/GridContainer';
import Success from '../../components/Typography/Success';
import Button from '../../components/CustomButtons/Button';
import Card from '../../components/Card/Card';
import CardHeader from '../../components/Card/CardHeader';
import CardBody from '../../components/Card/CardBody';
import PurchaseService from '../../services/PurchaseService';
import LocationService from '../../services/LocationService';

function ccyFormat(num) {
  return num && !isNaN(num) ? `${Number(num).toFixed(2)} $` : '';
}

function dateFormat(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, 0);
  const day = `${date.getUTCDate()}`.padStart(2, 0);
  const stringDate = [year, month, day].join('-');
  return stringDate;
}

// eslint-disable-next-line no-extend-native
Date.prototype.addHours = function (h) {
  this.setHours(this.getHours() + h);
  return this;
};

export default class PurchaseItems extends React.Component {
  state = {
    openMarkAsPaidDialog: false,
    openMarkAsOnDeliveryDialog: false,
    openMarkAsCustomClearanceDialog: false,
    openMarkAsArrivedDialog: false,
    loading: false,
    locations: [],
    plannedItems: [],
    paidItems: [],
    onDeliveryItems: [],
    customClearanceItems: [],
    arrivedItems: [],
  };

  constructor(props) {
    super(props);

    this.markAsPaidClicked = this.markAsPaidClicked.bind(this);
    this.markAsOnDeliveryClicked = this.markAsOnDeliveryClicked.bind(this);
    this.markAsCustomClearanceClicked = this.markAsCustomClearanceClicked.bind(this);
    this.markAsArrivedClicked = this.markAsArrivedClicked.bind(this);
    this.markAsPaid = this.markAsPaid.bind(this);
    this.markAsOnDelivery = this.markAsOnDelivery.bind(this);
    this.markAsCustomClearance = this.markAsCustomClearance.bind(this);
    this.markAsArrived = this.markAsArrived.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleLocationChange = this.handleLocationChange.bind(this);
    this.deleteClicked = this.deleteClicked.bind(this);
  }

  async componentDidMount() {
    const { purchase } = this.props;
    this.setState({
      plannedItems: purchase.purchaseDetail.filter((m) => m.status === 'Plan'),
      paidItems: purchase.purchaseDetail.filter((m) => m.status === 'Paid'),
      onDeliveryItems: purchase.purchaseDetail.filter((m) => m.status === 'OnDelivery'),
      customClearanceItems: purchase.purchaseDetail.filter((m) => m.status === 'CustomClearance'),
      arrivedItems: purchase.purchaseDetail.filter((m) => m.status === 'Arrived'),
    });
  }

  handleLocationChange = (event) => {
    const { locations } = this.state;
    const { locationName } = locations.find((m) => m.locationId === event.target.value);

    this.setState({
      locationId: event.target.value,
      locationName,
    });
  }

  handleClose() {
    this.setState({
      openMarkAsPaidDialog: false,
      openMarkAsOnDeliveryDialog: false,
      openMarkAsCustomClearanceDialog: false,
      openMarkAsArrivedDialog: false,
    });
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  markAsPaidClicked(amount, unitPrice, overheadCost, poNumber, purchaseDetailId) {
    const { purchase } = this.props;
    this.setState({
      openMarkAsPaidDialog: true,
      amount,
      unitPrice,
      overheadCost,
      poNumber,
      paidDate: dateFormat((new Date()).addHours(-8)),
      estimatedDelivery: dateFormat(purchase.deliveryDate),
      purchaseDetailId,
    });
  }

  async deleteClicked(purchaseDetailId) {
    this.setState({
      loading: true,
    });

    await PurchaseService.deletePurchaseDetail(purchaseDetailId);

    this.setState({
      loading: false,
    });
  }

  async markAsPaid() {
    this.setState({
      loading: true,
    });

    await this.updatePurchaseDetailStatus('Paid');

    this.setState({
      openMarkAsPaidDialog: false,
      loading: false,
    });
  }

  markAsOnDeliveryClicked(amount, unitPrice, overheadCost, poNumber, purchaseDetailId, paidDate) {
    const { purchase } = this.props;
    this.setState({
      openMarkAsOnDeliveryDialog: true,
      amount,
      unitPrice,
      overheadCost,
      poNumber,
      paidDate: dateFormat(paidDate),
      estimatedDelivery: dateFormat(purchase.deliveryDate),
      purchaseDetailId,
    });
  }

  async markAsOnDelivery() {
    this.setState({
      loading: true,
    });

    await this.updatePurchaseDetailStatus('OnDelivery');

    this.setState({
      openMarkAsOnDeliveryDialog: false,
      loading: false,
    });
  }

  markAsCustomClearanceClicked(amount, unitPrice, overheadCost, poNumber, purchaseDetailId) {
    const { purchase } = this.props;
    this.setState({
      openMarkAsCustomClearanceDialog: true,
      amount,
      unitPrice,
      overheadCost,
      poNumber,
      paidDate: dateFormat((new Date()).addHours(-8)),
      estimatedDelivery: dateFormat(purchase.deliveryDate),
      purchaseDetailId,
    });
  }

  async markAsCustomClearance() {
    this.setState({
      loading: true,
    });

    await this.updatePurchaseDetailStatus('CustomClearance');

    this.setState({
      openMarkAsCustomClearanceDialog: false,
      loading: false,
    });
  }

  markAsArrivedClicked(amount, unitPrice, overheadCost, poNumber, purchaseDetailId) {
    const { purchase } = this.props;
    LocationService.getLocationsForUser()
      .then((results) => this.setState({
        locations: results,
        openMarkAsArrivedDialog: true,
        amount,
        unitPrice,
        overheadCost,
        poNumber,
        arrivedDate: dateFormat((new Date()).addHours(-8)),
        estimatedDelivery: dateFormat(purchase.deliveryDate),
        purchaseDetailId,
      }));
  }

  async markAsArrived() {
    this.setState({
      loading: true,
    });

    const { locationId } = this.state;
    if (locationId && locationId > 0) {
      await this.updatePurchaseDetailStatus('Arrived');

      this.setState({
        openMarkAsArrivedDialog: false,
        loading: false,
      });
    } else {
      this.setState({
        openSnackbar: true,
        snackbarMessage: 'Please select a location!',
        snackbarColor: 'danger',
      });
    }

    this.setState({
      loading: false,
    });
  }

  async updatePurchaseDetailStatus(status) {
    const {
      purchaseDetailId,
      amount,
      unitPrice,
      overheadCost,
      paidDate,
      arrivedDate,
      estimatedDelivery,
      poNumber,
      locationId,
      locationName,
      paidItems,
      onDeliveryItems,
      customClearanceItems,
      arrivedItems,
    } = this.state;

    const purchaseDetailStatusUpdate = {
      amount,
      unitPrice,
      overheadCost,
      paidDate,
      arrivedDate,
      estimatedDelivery,
      poNumber,
      purchaseStatus: status,
      totalPrice: Number(unitPrice) * Number(amount) + Number(overheadCost),
      arrivedAtLocationId: locationId,
    };

    const result = await PurchaseService.updatePurchaseDetailStatus(
      purchaseDetailId, purchaseDetailStatusUpdate,
    );
    if (result === false
      || result === null
      || result.StatusCode === 500
      || result.StatusCode === 400) {
      this.setState({
        openSnackbar: true,
        snackbarMessage: 'Oops, looks like something went wrong!',
        snackbarColor: 'danger',
      });
    } else {
      purchaseDetailStatusUpdate.purchaseDetailId = result.purchaseDetailId;
      purchaseDetailStatusUpdate.productId = result.productId;
      purchaseDetailStatusUpdate.product = {
        productId: result.product.productId,
        productCode: result.product.productCode,
        productName: result.product.productName,
      };
      purchaseDetailStatusUpdate.location = {
        locationName,
      };

      if (status === 'Paid') {
        this.setState({
          paidItems: [...paidItems, purchaseDetailStatusUpdate],
        });
      } else if (status === 'OnDelivery') {
        this.setState({
          onDeliveryItems: [...onDeliveryItems, purchaseDetailStatusUpdate],
        });
      } else if (status === 'CustomClearance') {
        this.setState({
          customClearanceItems: [...customClearanceItems, purchaseDetailStatusUpdate],
        });
      } else if (status === 'Arrived') {
        this.setState({
          arrivedItems: [...arrivedItems, purchaseDetailStatusUpdate],
        });
      }
    }

    return true;
  }

  render() {
    const styles = {
      cardCategoryWhite: {
        '&,& a,& a:hover,& a:focus': {
          color: 'rgba(255,255,255,.62)',
          margin: '0',
          fontSize: '14px',
          marginTop: '0',
          marginBottom: '0',
        },
        '& a,& a:hover,& a:focus': {
          color: '#FFFFFF',
        },
      },
      cardTitleWhite: {
        color: '#FFFFFF',
        marginTop: '0px',
        minHeight: 'auto',
        fontWeight: '300',
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
        marginBottom: '3px',
        textDecoration: 'none',
        '& small': {
          color: '#777',
          fontSize: '65%',
          fontWeight: '400',
          lineHeight: '1',
        },
      },
    };

    const options = {
      paging: false,
      // pageSizeOptions: [25, 50, 100],
      // pageSize: 25,
      columnsButton: true,
      exportButton: true,
      // filtering: true,
    };

    const plannedItemsColumns = [
      { title: 'Product Code', field: 'product.productCode', readonly: true },
      { title: 'Product Name', field: 'product.productName', readonly: true },
      { title: 'Amount', field: 'amount', type: 'numeric' },
      { title: 'Unit Price ($)', field: 'unitPrice', type: 'numeric' },
      { title: 'Overhead Cost ($)', field: 'overheadCost', type: 'numeric' },
      {
        title: 'Total Price($)', field: 'totalPrice', type: 'numeric', readonly: true,
      },
      { title: 'Estimated Delivery', field: 'estimatedDelivery', hidden: true },
      { title: 'PO Number', field: 'poNumber', hidden: true },
      {
        title: 'purchaseDetailId', field: 'purchaseDetailId', hidden: true, readonly: true,
      },
    ];

    const paidItemsColumns = [
      { title: 'Product Code', field: 'product.productCode', readonly: true },
      { title: 'Product Name', field: 'product.productName', readonly: true },
      { title: 'Amount', field: 'amount', type: 'numeric' },
      { title: 'Unit Price ($)', field: 'unitPrice', type: 'numeric' },
      { title: 'Overhead Cost ($)', field: 'overheadCost', type: 'numeric' },
      {
        title: 'Total Price($)', field: 'totalPrice', type: 'numeric', readonly: true,
      },
      { title: 'Estimated Delivery', field: 'estimatedDelivery', hidden: true },
      { title: 'PO Number', field: 'poNumber', hidden: true },
      {
        title: 'purchaseDetailId', field: 'purchaseDetailId', hidden: true, readonly: true,
      },
    ];

    const onDeliveryItemsColumns = [
      { title: 'Product Code', field: 'product.productCode', readonly: true },
      { title: 'Product Name', field: 'product.productName', readonly: true },
      { title: 'Amount', field: 'amount', type: 'numeric' },
      { title: 'Unit Price ($)', field: 'unitPrice', type: 'numeric' },
      { title: 'Overhead Cost ($)', field: 'overheadCost', type: 'numeric' },
      {
        title: 'Total Price($)', field: 'totalPrice', type: 'numeric', readonly: true,
      },
      { title: 'Estimated Delivery', field: 'estimatedDelivery', hidden: true },
      { title: 'PO Number', field: 'poNumber', hidden: true },
      {
        title: 'purchaseDetailId', field: 'purchaseDetailId', hidden: true, readonly: true,
      },
    ];

    const customClearanceItemsColumns = [
      { title: 'Product Code', field: 'product.productCode', readonly: true },
      { title: 'Product Name', field: 'product.productName', readonly: true },
      { title: 'Amount', field: 'amount', type: 'numeric' },
      { title: 'Unit Price ($)', field: 'unitPrice', type: 'numeric' },
      { title: 'Overhead Cost ($)', field: 'overheadCost', type: 'numeric' },
      {
        title: 'Total Price($)', field: 'totalPrice', type: 'numeric', readonly: true,
      },
      { title: 'Estimated Delivery', field: 'estimatedDelivery', hidden: true },
      { title: 'PO Number', field: 'poNumber', hidden: true },
      {
        title: 'purchaseDetailId', field: 'purchaseDetailId', hidden: true, readonly: true,
      },
    ];

    const arrivedItemsColumns = [
      { title: 'Product Code', field: 'product.productCode', readonly: true },
      { title: 'Product Name', field: 'product.productName', readonly: true },
      {
        title: 'Amount', field: 'amount', type: 'numeric', readonly: true,
      },
      { title: 'Unit Price ($)', field: 'unitPrice', type: 'numeric' },
      { title: 'Overhead Cost ($)', field: 'overheadCost', type: 'numeric' },
      {
        title: 'Total Price($)', field: 'totalPrice', type: 'numeric', readonly: true,
      },
      { title: 'Location', field: 'location.locationName', readonly: true },
      { title: 'Estimated Delivery', field: 'estimatedDelivery', hidden: true },
      { title: 'PO Number', field: 'poNumber', hidden: true },
      {
        title: 'purchaseDetailId', field: 'purchaseDetailId', hidden: true, readonly: true,
      },
    ];

    const {
      openMarkAsArrivedDialog,
      openMarkAsCustomClearanceDialog,
      openMarkAsPaidDialog,
      openMarkAsOnDeliveryDialog,
      loading,
      poNumber,
      amount,
      overheadCost,
      unitPrice,
      estimatedDelivery,
      paidDate,
      arrivedDate,
      openSnackbar,
      snackbarMessage,
      snackbarColor,
      locations,
      locationId,
      plannedItems,
      paidItems,
      onDeliveryItems,
      customClearanceItems,
      arrivedItems,
    } = this.state;

    const { purchase } = this.props;

    return (
      <div>
        <Card ref={(el) => (this.plannedTable = el)}>
          <CardHeader color="info">
            <div className={styles.cardTitleWhite}>
              Planned Items
              {' '}
              {'  ('}
              PO Number:
              {' '}
              <b>{purchase.poNumber}</b>
              {' )'}
              <ReactToPrint
                trigger={() => (
                  <IconButton aria-label="Print">
                    <PrintIcon fontSize="small" />
                  </IconButton>
                )}
                content={() => this.plannedTable}
              />
            </div>
          </CardHeader>
          <CardBody>
            <MaterialTable
              columns={plannedItemsColumns}
              data={plannedItems}
              options={options}
              title=""
              actions={[{
                icon: 'arrow_downward',
                tooltip: 'Mark as Paid',
                onClick: (event, rowData) => this.markAsPaidClicked(
                  rowData.amount,
                  rowData.unitPrice,
                  rowData.overheadCost,
                  purchase.poNumber,
                  rowData.purchaseDetailId,
                ),
              }]}
              editable={{
                onRowUpdate: (newData, oldData) => new Promise((resolve) => {
                  setTimeout(() => {
                    {
                      const index = plannedItems.indexOf(oldData);
                      // eslint-disable-next-line no-param-reassign
                      newData.totalPrice = Number(newData.amount)
                                           * Number(newData.unitPrice)
                                           + Number(newData.overheadCost);
                      plannedItems[index] = newData;
                      PurchaseService.updatePurchaseDetail(newData);
                      this.setState({ plannedItems }, () => resolve());
                    }
                    resolve();
                  }, 1000);
                }),
                onRowDelete: (oldData) => new Promise((resolve) => {
                  setTimeout(() => {
                    {
                      this.deleteClicked(oldData.purchaseDetailId);
                      const index = plannedItems.indexOf(oldData);
                      plannedItems.splice(index, 1);
                      this.setState({ plannedItems }, () => resolve());
                    }
                    resolve();
                  }, 1000);
                }),
              }}
            />
            <Table className={styles.table}>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={4}><h5>Total</h5></TableCell>
                  <TableCell numeric><Success><h5>{ccyFormat(plannedItems.map((item) => item.totalPrice).reduce((prev, next) => prev + next, 0))}</h5></Success></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardBody>
        </Card>
        <Card ref={(el) => (this.paidTable = el)}>
          <CardHeader color="info">
            <div className={styles.cardTitleWhite}>
              Paid Items
              {'   ('}
              PO Number:
              {' '}
              <b>{purchase.poNumber}</b>
              {' )  '}
              <ReactToPrint
                trigger={() => (
                  <IconButton aria-label="Print">
                    <PrintIcon fontSize="small" />
                  </IconButton>
                )}
                content={() => this.paidTable}
              />
            </div>
          </CardHeader>
          <CardBody>
            <MaterialTable
              columns={paidItemsColumns}
              data={paidItems}
              options={options}
              title=""
              actions={[{
                icon: 'arrow_downward',
                tooltip: 'Mark as On Delivery',
                onClick: (event, rowData) => this.markAsOnDeliveryClicked(
                  rowData.amount,
                  rowData.unitPrice,
                  rowData.overheadCost,
                  purchase.poNumber,
                  rowData.purchaseDetailId,
                  rowData.paidDate,
                ),
              }]}
              editable={{
                onRowUpdate: (newData, oldData) => new Promise((resolve) => {
                  setTimeout(() => {
                    {
                      const index = paidItems.indexOf(oldData);
                      // eslint-disable-next-line no-param-reassign
                      newData.totalPrice = Number(newData.amount)
                                           * Number(newData.unitPrice)
                                           + Number(newData.overheadCost);
                      paidItems[index] = newData;
                      PurchaseService.updatePurchaseDetail(newData);
                      this.setState({ paidItems }, () => resolve());
                    }
                    resolve();
                  }, 1000);
                }),
                onRowDelete: (oldData) => new Promise((resolve) => {
                  setTimeout(() => {
                    {
                      this.deleteClicked(oldData.purchaseDetailId);
                      const index = paidItems.indexOf(oldData);
                      paidItems.splice(index, 1);
                      this.setState({ paidItems }, () => resolve());
                    }
                    resolve();
                  }, 1000);
                }),
              }}
            />
            <Table className={styles.table}>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={4}><h5>Total</h5></TableCell>
                  <TableCell numeric>
                    <Success>
                      <h5>
                        {ccyFormat(
                          paidItems
                            .map((item) => item.totalPrice)
                            .reduce((prev, next) => prev + next, 0),
                        )}
                      </h5>
                    </Success>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardBody>
        </Card>
        <Card ref={(el) => (this.onDeliveryTable = el)}>
          <CardHeader color="danger">
            <div className={styles.cardTitleWhite}>
              On Delivery Items
              {'   ('}
              PO Number:
              {' '}
              <b>{purchase.poNumber}</b>
              {' )  '}
              <ReactToPrint
                trigger={() => (
                  <IconButton aria-label="Print">
                    <PrintIcon fontSize="small" />
                  </IconButton>
                )}
                content={() => this.onDeliveryTable}
              />
            </div>
          </CardHeader>
          <CardBody>
            <MaterialTable
              columns={onDeliveryItemsColumns}
              data={onDeliveryItems}
              options={options}
              title=""
              actions={[{
                icon: 'arrow_downward',
                tooltip: 'Mark as Custom Clearance',
                onClick: (event, rowData) => this.markAsCustomClearanceClicked(
                  rowData.amount,
                  rowData.unitPrice,
                  rowData.overheadCost,
                  purchase.poNumber,
                  rowData.purchaseDetailId,
                ),
              }]}
              editable={{
                onRowUpdate: (newData, oldData) => new Promise((resolve) => {
                  setTimeout(() => {
                    {
                      const index = onDeliveryItems.indexOf(oldData);
                      // eslint-disable-next-line no-param-reassign
                      newData.totalPrice = Number(newData.amount)
                                           * Number(newData.unitPrice)
                                           + Number(newData.overheadCost);
                      onDeliveryItems[index] = newData;
                      PurchaseService.updatePurchaseDetail(newData);
                      this.setState({ onDeliveryItems }, () => resolve());
                    }
                    resolve();
                  }, 1000);
                }),
                onRowDelete: (oldData) => new Promise((resolve) => {
                  setTimeout(() => {
                    {
                      this.deleteClicked(oldData.purchaseDetailId);
                      const index = onDeliveryItems.indexOf(oldData);
                      onDeliveryItems.splice(index, 1);
                      this.setState({ onDeliveryItems }, () => resolve());
                    }
                    resolve();
                  }, 1000);
                }),
              }}
            />
            <Table className={styles.table}>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={4}><h5>Total</h5></TableCell>
                  <TableCell numeric><Success><h5>{ccyFormat(onDeliveryItems.map((item) => item.totalPrice).reduce((prev, next) => prev + next, 0))}</h5></Success></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardBody>
        </Card>
        <Card ref={(el) => (this.customClearanceTable = el)}>
          <CardHeader color="warning">
            <div className={styles.cardTitleWhite}>
              Custom Clearance Items
              {'   ('}
              PO Number:
              {' '}
              <b>{purchase.poNumber}</b>
              {' )  '}
              <ReactToPrint
                trigger={() => (
                  <IconButton aria-label="Print">
                    <PrintIcon fontSize="small" />
                  </IconButton>
                )}
                content={() => this.customClearanceTable}
              />
            </div>
          </CardHeader>
          <CardBody>
            <MaterialTable
              columns={customClearanceItemsColumns}
              data={customClearanceItems}
              options={options}
              title=""
              actions={[{
                icon: 'arrow_downward',
                tooltip: 'Mark as Arrived',
                onClick: (event, rowData) => this.markAsArrivedClicked(
                  rowData.amount,
                  rowData.unitPrice,
                  rowData.overheadCost,
                  purchase.poNumber,
                  rowData.purchaseDetailId,
                  rowData.paidDate,
                ),
              }]}
              editable={{
                onRowUpdate: (newData, oldData) => new Promise((resolve) => {
                  setTimeout(() => {
                    {
                      const index = customClearanceItems.indexOf(oldData);
                      // eslint-disable-next-line no-param-reassign
                      newData.totalPrice = Number(newData.amount)
                                         * Number(newData.unitPrice)
                                         + Number(newData.overheadCost);
                      customClearanceItems[index] = newData;
                      PurchaseService.updatePurchaseDetail(newData);
                      this.setState({ customClearanceItems }, () => resolve());
                    }
                    resolve();
                  }, 1000);
                }),
                onRowDelete: (oldData) => new Promise((resolve) => {
                  setTimeout(() => {
                    {
                      this.deleteClicked(oldData.purchaseDetailId);
                      const index = customClearanceItems.indexOf(oldData);
                      customClearanceItems.splice(index, 1);
                      this.setState({ customClearanceItems }, () => resolve());
                    }
                    resolve();
                  }, 1000);
                }),
              }}
            />
            <Table className={styles.table}>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={4}><h5>Total</h5></TableCell>
                  <TableCell numeric><Success><h5>{ccyFormat(customClearanceItems.map((item) => item.totalPrice).reduce((prev, next) => prev + next, 0))}</h5></Success></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardBody>
        </Card>
        <Card ref={(el) => (this.arrivedTable = el)}>
          <CardHeader color="success">
            <div className={styles.cardTitleWhite}>
              Arrived Items
              {'   ('}
              PO Number:
              {' '}
              <b>{purchase.poNumber}</b>
              {' )  '}
              <ReactToPrint
                trigger={() => (
                  <IconButton aria-label="Print">
                    <PrintIcon fontSize="small" />
                  </IconButton>
                )}
                content={() => this.arrivedTable}
              />
            </div>
          </CardHeader>
          <CardBody>
            <MaterialTable
              columns={arrivedItemsColumns}
              data={arrivedItems}
              options={options}
              title=""
              editable={{
                onRowUpdate: (newData, oldData) => new Promise((resolve) => {
                  setTimeout(() => {
                    {
                      const index = arrivedItems.indexOf(oldData);
                      // eslint-disable-next-line no-param-reassign
                      newData.totalPrice = Number(newData.amount)
                                           * Number(newData.unitPrice)
                                           + Number(newData.overheadCost);
                      arrivedItems[index] = newData;
                      PurchaseService.updatePurchaseDetail(newData);
                      this.setState({ arrivedItems }, () => resolve());
                    }
                    resolve();
                  }, 1000);
                }),
                onRowDelete: (oldData) => new Promise((resolve) => {
                  setTimeout(() => {
                    {
                      this.deleteClicked(oldData.purchaseDetailId);
                      const index = arrivedItems.indexOf(oldData);
                      arrivedItems.splice(index, 1);
                      this.setState({ arrivedItems }, () => resolve());
                    }
                    resolve();
                  }, 1000);
                }),
              }}
            />
            <Table className={styles.table}>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={6}><h5>Total</h5></TableCell>
                  <TableCell numeric>
                    <Success>
                      <h5>
                        {ccyFormat(arrivedItems.map((item) => item.totalPrice).reduce((prev, next) => prev + next, 0))}
                      </h5>
                    </Success>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardBody>
        </Card>
        <Dialog
          open={openMarkAsPaidDialog}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogContent>
            <Card>
              <CardHeader color="info">
                <div>Mark As Paid</div>
              </CardHeader>
              <CardBody>
                <FormControl component="fieldset">
                  <GridContainer md={12}>
                    <GridItem md={12}>
                      <TextField
                        onChange={this.handleChange}
                        name="amount"
                        label="Amount"
                        type="number"
                        value={amount}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                      <br />
                      <br />
                    </GridItem>
                    <GridItem md={12}>
                      <TextField
                        onChange={this.handleChange}
                        name="unitPrice"
                        label="Unit Price ($)"
                        type="number"
                        value={unitPrice}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                      <br />
                    </GridItem>
                    <GridItem md={12}>
                      <TextField
                        onChange={this.handleChange}
                        name="overheadCost"
                        label="Overhead Cost ($)"
                        type="number"
                        value={overheadCost}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                      <br />
                    </GridItem>
                    <GridItem md={12}>
                      <h4>
                        Total:
                        {Number(unitPrice) * Number(amount) + Number(overheadCost)}
                      </h4>
                      <br />
                    </GridItem>
                    <GridItem md={12}>
                      <TextField
                        onChange={this.handleChange}
                        name="estimatedDelivery"
                        label="Estimated Delivery"
                        type="date"
                        value={estimatedDelivery}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                      <br />
                      <br />
                    </GridItem>
                    <GridItem md={12}>
                      <TextField
                        onChange={this.handleChange}
                        name="paidDate"
                        label="Paid Date"
                        type="date"
                        value={paidDate}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                      <br />
                      <br />
                    </GridItem>
                    <GridItem md={12}>
                      <TextField
                        onChange={this.handleChange}
                        name="poNumber"
                        label="PO Number"
                        type="text"
                        value={poNumber}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
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
            <Button disabled={loading} onClick={this.markAsPaid} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={openMarkAsOnDeliveryDialog}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogContent>
            <Card>
              <CardHeader color="info">
                <div>Mark As On Delivery</div>
              </CardHeader>
              <CardBody>
                <FormControl component="fieldset">
                  <GridContainer md={12}>
                    <GridItem md={12}>
                      <TextField
                        onChange={this.handleChange}
                        name="amount"
                        label="Amount"
                        type="number"
                        value={amount}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                      <br />
                      <br />
                    </GridItem>
                    <GridItem md={12}>
                      <TextField
                        onChange={this.handleChange}
                        disabled
                        name="unitPrice"
                        label="Unit Price ($)"
                        type="number"
                        value={unitPrice}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                      <br />
                    </GridItem>
                    <GridItem md={12}>
                      <TextField
                        onChange={this.handleChange}
                        name="overheadCost"
                        label="Overhead Cost ($)"
                        type="number"
                        value={overheadCost}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                      <br />
                    </GridItem>
                    <GridItem md={12}>
                      <h4>
                        Total:
                        {Number(unitPrice) * Number(amount) + Number(overheadCost)}
                      </h4>
                      <br />
                    </GridItem>
                    <GridItem md={12}>
                      <TextField
                        onChange={this.handleChange}
                        name="estimatedDelivery"
                        label="Estimated Delivery"
                        type="date"
                        value={estimatedDelivery}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                      <br />
                      <br />
                    </GridItem>
                    {/* <GridItem md={12}>
                      <TextField
                        disabled
                        onChange={this.handleChange}
                        name="paidDate"
                        label="Paid Date"
                        type="date"
                        value={paidDate}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                      <br />
                      <br />
                    </GridItem> */}
                    {/* <GridItem md={12}>
                      <TextField
                        disabled
                        onChange={this.handleChange}
                        name="poNumber"
                        label="PO Number"
                        type="text"
                        value={poNumber}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </GridItem> */}
                  </GridContainer>
                </FormControl>
              </CardBody>
            </Card>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="info">
              Cancel
            </Button>
            <Button disabled={loading} onClick={this.markAsOnDelivery} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={openMarkAsCustomClearanceDialog}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogContent>
            <Card>
              <CardHeader color="info">
                <div>Mark As Custom Clearance</div>
              </CardHeader>
              <CardBody>
                <FormControl component="fieldset">
                  <GridContainer md={12}>
                    <GridItem md={12}>
                      <TextField
                        onChange={this.handleChange}
                        name="amount"
                        label="Amount"
                        type="number"
                        value={amount}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                      <br />
                      <br />
                    </GridItem>
                    <GridItem md={12}>
                      <TextField
                        onChange={this.handleChange}
                        disabled
                        name="unitPrice"
                        label="Unit Price ($)"
                        type="number"
                        value={unitPrice}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                      <br />
                    </GridItem>
                    <GridItem md={12}>
                      <TextField
                        onChange={this.handleChange}
                        name="overheadCost"
                        label="Overhead Cost ($)"
                        type="number"
                        value={overheadCost}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                      <br />
                    </GridItem>
                    <GridItem md={12}>
                      <h4>
                        Total:
                        {Number(unitPrice) * Number(amount) + Number(overheadCost)}
                      </h4>
                      <br />
                    </GridItem>
                    <GridItem md={12}>
                      <TextField
                        onChange={this.handleChange}
                        name="estimatedDelivery"
                        label="Estimated Delivery"
                        type="date"
                        value={estimatedDelivery}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                      <br />
                      <br />
                    </GridItem>
                    <GridItem md={12}>
                      <TextField
                        disabled
                        onChange={this.handleChange}
                        name="paidDate"
                        label="Paid Date"
                        type="date"
                        value={paidDate}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                      <br />
                      <br />
                    </GridItem>
                    {/* <GridItem md={12}>
                      <TextField
                        disabled
                        onChange={this.handleChange}
                        name="poNumber"
                        label="PO Number"
                        type="text"
                        value={poNumber}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </GridItem> */}
                  </GridContainer>
                </FormControl>
              </CardBody>
            </Card>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="info">
              Cancel
            </Button>
            <Button disabled={loading} onClick={this.markAsCustomClearance} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={openMarkAsArrivedDialog}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogContent>
            <Card>
              <CardHeader color="info">
                <div>Mark As Arrived</div>
              </CardHeader>
              <CardBody>
                <FormControl component="fieldset">
                  <GridContainer md={12}>
                    <GridItem md={12}>
                      <TextField
                        onChange={this.handleChange}
                        name="amount"
                        label="Amount"
                        type="number"
                        value={amount}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                      <br />
                      <br />
                    </GridItem>
                    <GridItem md={12}>
                      <TextField
                        onChange={this.handleChange}
                        disabled
                        name="unitPrice"
                        label="Unit Price ($)"
                        type="number"
                        value={unitPrice}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                      <br />
                    </GridItem>
                    <GridItem md={12}>
                      <TextField
                        onChange={this.handleChange}
                        name="overheadCost"
                        label="Overhead Cost ($)"
                        type="number"
                        value={overheadCost}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                      <br />
                    </GridItem>
                    <GridItem md={12}>
                      <h4>
                        Total:
                        {Number(unitPrice) * Number(amount) + Number(overheadCost)}
                      </h4>
                      <br />
                    </GridItem>
                    <GridItem md={12}>
                      <TextField
                        onChange={this.handleChange}
                        name="estimatedDelivery"
                        label="Estimated Delivery"
                        type="date"
                        value={estimatedDelivery}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                      <br />
                      <br />
                    </GridItem>
                    <GridItem md={12}>
                      <TextField
                        onChange={this.handleChange}
                        name="arrivedDate"
                        label="Arrived Date"
                        type="date"
                        value={arrivedDate}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                      <br />
                      <br />
                    </GridItem>
                    {/* <GridItem md={12}>
                      <TextField
                        disabled
                        onChange={this.handleChange}
                        name="poNumber"
                        label="PO Number"
                        type="text"
                        value={poNumber}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </GridItem> */}
                    <GridItem md={12}>
                      <FormControl className={styles.formControl}>
                        <InputLabel htmlFor="location">Arrived at Location</InputLabel>
                        <Select
                          value={locationId}
                          onChange={this.handleLocationChange}
                          style={{
                            minWidth: 300,
                            padding: 5,
                            margin: 5,
                          }}
                          inputProps={{
                            name: 'location',
                            id: 'location',
                            width: '300',
                          }}
                        >
                          {locations && (
                            locations.map((l, key) => (
                              <MenuItem name={key} value={l.locationId}>
                                {l.locationName}
                              </MenuItem>
                            ))
                          )}
                        </Select>
                      </FormControl>
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
            <Button disabled={loading} onClick={this.markAsArrived} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
        <Snackbar
          place="tl"
          color={snackbarColor}
          icon={Check}
          message={snackbarMessage}
          open={openSnackbar}
          closeNotification={() => this.setState({ openSnackbar: false })}
          close
        />

      </div>
    );
  }
}

PurchaseItems.propTypes = {
  purchase: PropTypes.object.isRequired,
};
