import React from 'react';
import MUIDataTable from 'mui-datatables';
import TextField from '@material-ui/core/TextField';
import Button from '../../components/CustomButtons/Button';
import GridItem from '../../components/Grid/GridItem';
import GridContainer from '../../components/Grid/GridContainer';
import Card from '../../components/Card/Card';
import CardHeader from '../../components/Card/CardHeader';
import CardBody from '../../components/Card/CardBody';
import ReportService from '../../services/ReportService';

export default class ProductSalesReport extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fromDate: '',
      toDate: '',
    };
    this.search = this.search.bind(this);
  }

  componentDidMount() {
    this.setState({
      fromDate: new Date(Date.now()),
      toDate: new Date(Date.now()),
    });
  }

  handleChange = name => (event) => {
    this.setState({
      [name]: event.target.value,
    });
  };

  search() {
    const { fromDate, toDate } = this.state;
    const columns = ['productTypeName', 'productCode', 'productName', 'vanTotalSales', 'vanAmount', 'vanBalance', 'abbTotalSales', 'abbAmount', 'abbBalance'];
    ReportService.getProductSales(fromDate, toDate)
      .then(results => results.map(row => columns.map(column => row[column] || '')))
      .then(data => this.setState({ reportData: data }));

    const productSalesDetailColumns = ['locationName', 'productTypeName', 'productCode', 'productName', 'orderId', 'customerCode', 'companyName', 'totalSales', 'amount'];
    ReportService.getProductSalesDetail(fromDate, toDate)
      .then(results => results.map(row => productSalesDetailColumns.map(column => row[column] || '')))
      .then(data => this.setState({ productSalesDetailData: data }));
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

    const columns = [
      {
        name: 'Category',
        options: {
          display: false,
        },
      },
      {
        name: 'Product Code',
        options: {
          filter: false,
        },
      },
      {
        name: 'Product Name',
        options: {
          filter: true,
        },
      },
      {
        name: 'Van Sales ($)',
        options: {
          filter: false,
        },
      },
      {
        name: 'Van Sales Amount',
        options: {
          filter: false,
        },
      },
      {
        name: 'Van Balance',
        options: {
          filter: false,
        },
      },
      {
        name: 'Abb Sales ($)',
        options: {
          filter: true,
        },
      },
      {
        name: 'Abb Sales Amount',
        options: {
          filter: true,
        },
      },
      {
        name: 'Abb Balance',
        options: {
          filter: true,
        },
      }];

    const productSalesDetailColumns = [
      {
        name: 'Location Name',
      },
      {
        name: 'Category',
        options: {
          filter: false,
          display: false,
        },
      },
      {
        name: 'Product Code',
        options: {
          filter: true,
        },
      },
      {
        name: 'Product Name',
        options: {
          filter: true,
        },
      },
      {
        name: 'Order Id',
        options: {
          filter: false,
        },
      },
      {
        name: 'Customer Code',
        options: {
          filter: true,
          display: false,
        },
      },
      {
        name: 'Company Name',
        options: {
          filter: true,
        },
      },
      {
        name: 'Total Sales ($)',
        options: {
          filter: false,
        },
      },
      {
        name: 'Amount',
        options: {
          filter: false,
        },
      }];

    const options = {
      filterType: 'checkbox',
      rowHover: true,
      resizableColumns: true,
      selectableRows: false,
      rowsPerPageOptions: [25, 50, 100],
      rowsPerPage: 25,
    };

    const { reportData, productSalesDetailData, fromDate, toDate } = this.state;

    return (
      <div>
        <GridContainer>
          <GridItem xs={12} sm={12} md={12}>
            <Card>
              <CardHeader color="primary">
                <div className={styles.cardTitleWhite}>Product Sales Report</div>
              </CardHeader>
              <CardBody>
                <GridContainer>
                  <GridItem xs={12} sm={12} md={3}>
                    <TextField
                      onChange={this.handleChange('fromDate')}
                      id="date"
                      label="From Date"
                      type="date"
                      value={fromDate}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </GridItem>
                  <GridItem xs={12} sm={12} md={3}>
                    <TextField
                      onChange={this.handleChange('toDate')}
                      id="date"
                      label="To Date"
                      type="date"
                      value={toDate}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </GridItem>
                  <GridItem xs={12} sm={12} md={3}>
                    <Button color="info" onClick={this.search}>Search</Button>
                  </GridItem>
                </GridContainer>
                <MUIDataTable
                  title="Product Sales Report"
                  data={reportData}
                  columns={columns}
                  options={options}
                />

                <MUIDataTable
                  title="Product Sales Detail Report"
                  data={productSalesDetailData}
                  columns={productSalesDetailColumns}
                  options={options}
                />
              </CardBody>
            </Card>
          </GridItem>
        </GridContainer>
      </div>
    );
  }
}
