/* eslint-disable no-unused-vars */
// These functions currently implement the FEDEX Sandbox Environment API
// and therefore use the requisite requests for that.  In a production
// environment these request bodies need to be changed to represent the
// given function parameters.

exports.fetchShippingServiceTypes = async (cart, zip, accessToken) => {
  const url = 'https://apis-sandbox.fedex.com';
  const servicesPath = '/availability/v1/packageandserviceoptions';

  // Fetch service options from FEDEX API
  const serviceOptionsBody = JSON.stringify({
    requestedShipment: {
      shipper: {
        address: {
          // Your postal code and country code
          postalCode: '75063',
          countryCode: 'US',
        },
      },
      recipients: [
        {
          address: {
            // Recipients postal code and country code passed in as zip
            postalCode: '38017',
            countryCode: 'US',
          },
        },
      ],
    },
    // Change to suit your needs (see Fedex service availability api documentation)
    carrierCodes: ['FDXE', 'FDXG'],
  });

  const response = await fetch(url + servicesPath, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-locale': 'en_US',
      Authorization: `Bearer ${accessToken}`,
    },
    body: serviceOptionsBody,
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    console.log('Services Path Failed!!!!');
    console.log(error);
    throw error;
  }
  const shippingServices = await response.json();

  // Only return services which meet these requirements
  const visibleServices = shippingServices.output.packageOptions.filter(
    (service) => {
      return (
        service.maxWeightAllowed.value >= cart.totalWeight &&
        (service.maxDeclaredValue?.amount >= cart.totalPrice ||
          !service.maxDeclaredValue)
      );
    }
  );

  return visibleServices.map((service) => service.serviceType.key);
};

exports.fetchTransitTimes = async (_cart, _zip, accessToken, serviceTypes) => {
  // Fetch transit times from FEDEX API
  const url = 'https://apis-sandbox.fedex.com';
  const transitPath = '/availability/v1/transittimes';

  const transitTimesBody = JSON.stringify({
    requestedShipment: {
      shipper: {
        address: {
          // Your postal code and country code
          postalCode: '38017',
          countryCode: 'US',
        },
      },
      recipients: [
        {
          address: {
            // Recipients postal code and country code
            postalCode: '38127',
            countryCode: 'US',
          },
        },
      ],
      packagingType: 'YOUR_PACKAGING',
      requestedPackageLineItems: [
        {
          weight: {
            units: 'LB',
            // Should be cart.totalWeight
            value: '10',
          },
        },
      ],
    },
    carrierCodes: ['FDXG'],
  });

  const response = await fetch(url + transitPath, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-locale': 'en_US',
      Authorization: `Bearer ${accessToken}`,
    },
    body: transitTimesBody,
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    console.log('Transit Times Path Failed!!!!!');
    console.log(error);
    throw error;
  }

  const transitTimes = await response.json();
  const transitTimeDetails =
    transitTimes.output.transitTimes[0].transitTimeDetails;
  const filteredTransitTimes = transitTimeDetails.filter((transitTime) => {
    return serviceTypes.indexOf(transitTime.serviceType) >= 0;
  });
  const paredTransitTimes = filteredTransitTimes.map((service) => {
    return {
      serviceType: service.serviceType,
      serviceName: service.serviceName,
      transitDays: service.commit.transitDays.description,
    };
  });

  return paredTransitTimes;
};

exports.fetchShippingRates = async (
  cart,
  zip,
  accessToken,
  serviceTypes,
  rateType
) => {
  // Fetch transit times from FEDEX API
  const url = 'https://apis-sandbox.fedex.com';
  const transitPath = '/rate/v1/rates/quotes';

  const shippingRatesBody = JSON.stringify({
    accountNumber: {
      value: 'XXXXX7364', // Your Fedex account number
    },
    requestedShipment: {
      shipper: {
        address: {
          // Your postal code and country code
          postalCode: 65247,
          countryCode: 'US',
        },
      },
      recipient: {
        address: {
          // Recipients postal code and country code
          postalCode: 75063,
          countryCode: 'US',
        },
      },
      pickupType: 'DROPOFF_AT_FEDEX_LOCATION',
      // Types of rates to be returned
      rateRequestType: ['ACCOUNT', 'LIST'],
      requestedPackageLineItems: [
        {
          weight: {
            units: 'LB',
            // Should be cart.totalWeight
            value: 10,
          },
        },
      ],
    },
  });

  const response = await fetch(url + transitPath, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-locale': 'en_US',
      Authorization: `Bearer ${accessToken}`,
    },
    body: shippingRatesBody,
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    console.log('Shipping Rates Path Failed!!!!!');
    console.log(error);
    throw error;
  }

  const shippingRates = await response.json();

  const shippingRatesDetails = shippingRates.output.rateReplyDetails;
  const filteredShippingRates = shippingRatesDetails.filter(
    (shippingRate) => serviceTypes.indexOf(shippingRate.serviceType) >= 0
  );
  const paredShippingRates = filteredShippingRates.map((shippingRate) => {
    return {
      serviceType: shippingRate.serviceType,
      totalCharge: shippingRate.ratedShipmentDetails.find((shipmentDetails) => {
        return rateType
          ? shipmentDetails.rateType === rateType
          : shipmentDetails.rateType === 'LIST';
      }).totalNetCharge,
    };
  });

  return paredShippingRates;
};

exports.createNewShipment = async (
  cart,
  customerAddress,
  accessToken,
  serviceTypes
) => {
  let name = 'main';
  // Fetch transit times from FEDEX API
  const url = 'https://apis-sandbox.fedex.com';
  const transitPath = '/ship/v1/openshipments/create';

  const newShipmentBody = JSON.stringify({
    index: 'Test1234',
    requestedShipment: {
      shipper: {
        contact: {
          personName: 'SENDER NAME',
          phoneNumber: '901xxx8595',
        },
        address: {
          streetLines: ['SENDER ADDRESS 1'],
          city: 'MEMPHIS',
          stateOrProvinceCode: 'TN',
          postalCode: '38116',
          countryCode: 'US',
        },
      },
      recipients: [
        {
          contact: {
            personName: 'RECIPIENT NAME',
            phoneNumber: '901xxx8595',
          },
          address: {
            streetLines: [
              'RECIPIENT ADDRESS 1', // [ Address Line 1,
              // Address Line 2 ]
            ],
            city: 'MEMPHIS',
            stateOrProvinceCode: 'TN',
            postalCode: '38116',
            countryCode: 'US',
          },
        },
      ],
      serviceType: 'STANDARD_OVERNIGHT', // Provided Service Type
      packagingType: 'YOUR_PACKAGING',
      pickupType: 'DROPOFF_AT_FEDEX_LOCATION',
      shippingChargesPayment: {
        paymentType: 'SENDER',
      },
      requestedPackageLineItems: [
        {
          weight: {
            units: 'LB',
            value: '20', // shipment order weight
          },
        },
      ],
    },
    accountNumber: {
      value: 'Your account number',
    },
  });

  const response = await fetch(url + transitPath, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-locale': 'en_US',
      Authorization: `Bearer ${accessToken}`,
    },
    body: newShipmentBody,
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    console.log('Shipping Rates Path Failed!!!!!');
    console.log(error);
    throw error;
  }

  const data = await response.json();

  const newShipment = data.output.transactionShipments[0];
  const paredShipment = {
    ship_datestamp: newShipment.shipDatestamp,
    service_name: newShipment.serviceName,
    master_tracking_number: newShipment.masterTrackingNumber,
    expected_delivery_day:
      newShipment.completedShipmentDetail.operationalDetail.deliveryDay,
    expected_delivery_date:
      newShipment.completedShipmentDetail.operationalDetail.deliveryDate,
  };

  return paredShipment;
};
