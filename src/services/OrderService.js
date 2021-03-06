import RestUtilities from './RestUtilities';

export default class OrderService {
  static async saveOrder(order) {
    try {
      const response = await RestUtilities.post(
        'orders',
        order,
      );
      return response.content;
    } catch (err) {
      return false;
    }
  }

  static async updateOrder(orderId, order) {
    try {
      const response = await RestUtilities.put(
        `orders/${orderId}`,
        order,
      );
      return response.content;
    } catch (err) {
      return false;
    }
  }

  static async updateOrderStatus(orderId, orderStatus) {
    try {
      const response = await RestUtilities.put(
        `orders/${orderId}/status`,
        orderStatus,
      );
      return response.content;
    } catch (err) {
      return false;
    }
  }

  static async updateOrderPayment(orderId, orderPayment) {
    try {
      const response = await RestUtilities.put(
        `orders/${orderId}/payment`,
        orderPayment,
      );
      return response.content;
    } catch (err) {
      return false;
    }
  }

  static async updateOrderLocation(orderId, locationId) {
    try {
      const response = await RestUtilities.put(
        `orders/${orderId}/move/${locationId}`,
        {},
      );
      return response.content;
    } catch (err) {
      return false;
    }
  }

  static async updateOrderInfo(orderId, orderInfo) {
    try {
      const response = await RestUtilities.put(
        `orders/${orderId}/info`,
        orderInfo,
      );
      return response.content;
    } catch (err) {
      return false;
    }
  }

  static async updateOrderCustomer(orderId, orderCustomer) {
    try {
      const response = await RestUtilities.put(
        `orders/${orderId}/customer`,
        orderCustomer,
      );
      return response.content;
    } catch (err) {
      return false;
    }
  }

  static async getOrders() {
    try {
      const response = await RestUtilities.get(
        'orders',
      );
      return response.content;
    } catch (err) {
      return false;
    }
  }

  static async getOrdersByLocation(locationId, fromDate, toDate) {
    try {
      const response = await RestUtilities.get(
        `orders/location/${locationId}?fromDate=${fromDate}&todate=${toDate}`,
      );
      return response.content;
    } catch (err) {
      return false;
    }
  }

  static async getCustomerOrders(customerId) {
    try {
      const response = await RestUtilities.get(
        `orders/customer/${customerId}`,
      );
      return response.content;
    } catch (err) {
      return false;
    }
  }

  static async getOrderDetail(orderId) {
    try {
      const response = await RestUtilities.get(
        `orders/${orderId}`,
      );
      return response.content;
    } catch (err) {
      return false;
    }
  }

  static async emailOrder(orderId, email) {
    try {
      const response = await RestUtilities.get(
        `orders/${orderId}/email?email=${email}`,
      );
      return response.content;
    } catch (err) {
      return false;
    }
  }

  static async printOrder(orderId) {
    try {
      const response = await RestUtilities.getBlob(`orders/${orderId}/print`);
      return response;
    } catch (err) {
      return false;
    }
  }

  static async packingOrder(orderId) {
    try {
      const response = await RestUtilities.getBlob(`orders/${orderId}/packingSlip`);
      return response;
    } catch (err) {
      return false;
    }
  }

  static async validateInventory(inventoryValidationRequest) {
    try {
      const response = await RestUtilities.put(
        'orders/validateinventory',
        inventoryValidationRequest,
      );
      return response.content;
    } catch (err) {
      return false;
    }
  }
}
