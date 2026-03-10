package com.qacts.commonservice.controller;

import com.qacts.commonservice.entity.AccountType;
import com.qacts.commonservice.entity.City;
import com.qacts.commonservice.entity.Country;
import com.qacts.commonservice.entity.CustomerType;
import com.qacts.commonservice.entity.PaymentType;
import com.qacts.commonservice.repository.AccountTypeRepository;
import com.qacts.commonservice.repository.CityRepository;
import com.qacts.commonservice.repository.CountryRepository;
import com.qacts.commonservice.repository.CustomerTypeRepository;
import com.qacts.commonservice.repository.PaymentTypeRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/common")
public class CommonController {

    private final CountryRepository countryRepository;
    private final CityRepository cityRepository;
    private final AccountTypeRepository accountTypeRepository;
    private final CustomerTypeRepository customerTypeRepository;
    private final PaymentTypeRepository paymentTypeRepository;

    public CommonController(
            CountryRepository countryRepository,
            CityRepository cityRepository,
            AccountTypeRepository accountTypeRepository,
            CustomerTypeRepository customerTypeRepository,
            PaymentTypeRepository paymentTypeRepository) {
        this.countryRepository = countryRepository;
        this.cityRepository = cityRepository;
        this.accountTypeRepository = accountTypeRepository;
        this.customerTypeRepository = customerTypeRepository;
        this.paymentTypeRepository = paymentTypeRepository;
    }

    @GetMapping("/countries")
    public List<Country> getAllCountries() {
        return countryRepository.findAll();
    }

    @GetMapping("/cities")
    public List<City> getAllCities() {
        return cityRepository.findAll();
    }

    @GetMapping("/account-types")
    public List<AccountType> getAllAccountTypes() {
        return accountTypeRepository.findAll();
    }

    @GetMapping("/customer-types")
    public List<CustomerType> getAllCustomerTypes() {
        return customerTypeRepository.findAll();
    }

    @GetMapping("/payment-types")
    public List<PaymentType> getAllPaymentTypes() {
        return paymentTypeRepository.findAll();
    }

    @PostMapping("/countries")
    public Country createCountry(@RequestBody Country country) {
        return countryRepository.save(country);
    }
}
