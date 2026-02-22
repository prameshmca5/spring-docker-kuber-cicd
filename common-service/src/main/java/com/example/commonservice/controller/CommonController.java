package com.example.commonservice.controller;

import com.example.commonservice.entity.*;
import com.example.commonservice.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/common")
public class CommonController {

    @Autowired
    private CountryRepository countryRepository;

    @Autowired
    private CityRepository cityRepository;

    @Autowired
    private AccountTypeRepository accountTypeRepository;

    @Autowired
    private CustomerTypeRepository customerTypeRepository;

    @Autowired
    private PaymentTypeRepository paymentTypeRepository;

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
