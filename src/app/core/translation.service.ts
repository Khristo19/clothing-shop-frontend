import { Injectable, signal, computed } from '@angular/core';

export type Language = 'ge' | 'en';

export interface Translations {
  // Common
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    close: string;
    refresh: string;
    loading: string;
    search: string;
    logout: string;
    clear: string;
    remove: string;
    submit: string;
    yes: string;
    no: string;
  };
  // Login
  login: {
    signIn: string;
    email: string;
    password: string;
    logIn: string;
    loggingIn: string;
    emailRequired: string;
    passwordRequired: string;
    emailWhitespace: string;
    passwordWhitespace: string;
  };
  // Admin Dashboard
  dashboard: {
    title: string;
    subtitle: string;
    adminPortal: string;
    welcomeBack: string;
    manageShop: string;
  };
  // Navigation
  nav: {
    products: string;
    offers: string;
    orders: string;
    users: string;
    settings: string;
    switchToCashier: string;
    backToAdmin: string;
  };
  // Cashier
  cashier: {
    title: string;
    pointOfSale: string;
    myOffers: string;
  };
  // POS
  pos: {
    title: string;
    subtitle: string;
    inventory: string;
    inventorySubtitle: string;
    browseCatalog: string;
    hideProductList: string;
    searchPlaceholder: string;
    loadingCatalog: string;
    noItemsMatch: string;
    noDescription: string;
    inStock: string;
    cart: string;
    items: string;
    total: string;
    cartEmpty: string;
    unit: string;
    leftInStock: string;
    subtotal: string;
    discounts: string;
    tax: string;
    cash: string;
    card: string;
    requestAdminDiscount: string;
    completeSale: string;
    selectAcquiringBank: string;
    selectBankSubtitle: string;
    tbcBank: string;
    bankOfGeorgia: string;
    shopCounter: string;
    discountType: string;
    percentage: string;
    manualAmount: string;
    value: string;
    notesToAdmin: string;
    notesPlaceholder: string;
    paymentMethod: string;
    sendToAdmin: string;
    sending: string;
  };
  // Offers Status
  offersStatus: {
    title: string;
    subtitle: string;
    loadingOffers: string;
    noOffersYet: string;
    noOffersSubtitle: string;
    submitted: string;
    items: string;
    discountType: string;
    discountValue: string;
    cartTotal: string;
    paymentMethod: string;
    note: string;
    pending: string;
    approved: string;
    rejected: string;
    fixedAmount: string;
    cardTBC: string;
    cardBOG: string;
  };
  // Products
  products: {
    title: string;
    subtitle: string;
    addProduct: string;
    editProduct: string;
    totalProducts: string;
    lowStock: string;
    searchPlaceholder: string;
    noProducts: string;
    name: string;
    price: string;
    quantity: string;
    size: string;
    sizeOptional: string;
    description: string;
    image: string;
    inStock: string;
    lastUpdated: string;
    actions: string;
    productImage: string;
    uploadFile: string;
    useUrl: string;
    enterUrl: string;
    preview: string;
    saveProduct: string;
    updateProduct: string;
    saving: string;
    fileFormats: string;
    selected: string;
    units: string;
    location: string;
    locationOptional: string;
    initialCost: string;
    initialCostOptional: string;
  };
  // Offers
  offers: {
    title: string;
    subtitle: string;
    newOffer: string;
    totalOffers: string;
    pendingApproval: string;
    approved: string;
    createOffer: string;
    noOffers: string;
    approve: string;
    reject: string;
  };
  // Orders
  orders: {
    title: string;
    subtitle: string;
    ordersRecorded: string;
    totalRevenue: string;
    lastOrder: string;
    noOrders: string;
    orderNumber: string;
    items: string;
    total: string;
    cashier: string;
  };
  // Payment Methods
  paymentMethods: {
    cash: string;
    card: string;
    tbcBank: string;
    bankOfGeorgia: string;
  };
  // Settings
  settings: {
    title: string;
    subtitle: string;
    generalConfig: string;
    taxRate: string;
    currency: string;
    lowStockThreshold: string;
    saveChanges: string;
    resetDefaults: string;
    infoTitle: string;
    infoMessage: string;
    taxHelper: string;
    currencyHelper: string;
    lowStockHelper: string;
    successMessage: string;
    errorMessage: string;
  };
  // Dark Mode
  theme: {
    dark: string;
    light: string;
  };
  // Reports
  reports: {
    userPerformance: string;
    userPerformanceSubtitle: string;
    cashierPerformance: string;
    totalRevenue: string;
    totalTransactions: string;
    activeUsers: string;
    userRankings: string;
    exportCSV: string;
    noSalesData: string;
    noSalesSubtitle: string;
    revenue: string;
    transactions: string;
    avgSale: string;
    period: string;
    status: string;
    noSalesRecorded: string;
    role: string;
    admin: string;
    cashier: string;
    thisMonth: string;
    lastMonth: string;
    thisYear: string;
    applyFilters: string;
    from: string;
    to: string;
    dateRange: string;
  };
  // Users
  users: {
    title: string;
    subtitle: string;
    totalUsers: string;
    addUser: string;
    editUser: string;
    createUser: string;
    updateUser: string;
    deleteUser: string;
    noUsers: string;
    name: string;
    surname: string;
    email: string;
    password: string;
    role: string;
    admin: string;
    cashier: string;
    createdAt: string;
    actions: string;
    namePlaceholder: string;
    surnamePlaceholder: string;
    emailPlaceholder: string;
    passwordPlaceholder: string;
    emailRequired: string;
    passwordRequired: string;
    deleteConfirmTitle: string;
    deleteConfirmMessage: string;
  };
}

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly STORAGE_KEY = 'app-language';

  // Current language signal
  readonly currentLanguage = signal<Language>(this.loadLanguagePreference());

  // Computed translations based on current language
  readonly t = computed(() => this.getTranslations(this.currentLanguage()));

  constructor() {}

  private loadLanguagePreference(): Language {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved === 'en' || saved === 'ge') {
        return saved;
      }
    } catch (error) {
      console.error('Failed to load language preference:', error);
    }
    // Default to Georgian
    return 'ge';
  }

  private saveLanguagePreference(lang: Language): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, lang);
    } catch (error) {
      console.error('Failed to save language preference:', error);
    }
  }

  setLanguage(lang: Language): void {
    this.currentLanguage.set(lang);
    this.saveLanguagePreference(lang);
  }

  toggleLanguage(): void {
    const newLang: Language = this.currentLanguage() === 'ge' ? 'en' : 'ge';
    this.setLanguage(newLang);
  }

  private getTranslations(lang: Language): Translations {
    return lang === 'ge' ? this.getGeorgianTranslations() : this.getEnglishTranslations();
  }

  private getGeorgianTranslations(): Translations {
    return {
      common: {
        save: 'შენახვა',
        cancel: 'გაუქმება',
        delete: 'წაშლა',
        edit: 'რედაქტირება',
        close: 'დახურვა',
        refresh: 'განახლება',
        loading: 'იტვირთება',
        search: 'ძებნა',
        logout: 'გასვლა',
        clear: 'გასუფთავება',
        remove: 'წაშლა',
        submit: 'გაგზავნა',
        yes: 'დიახ',
        no: 'არა',
      },
      login: {
        signIn: 'შესვლა',
        email: 'ელ. ფოსტა',
        password: 'პაროლი',
        logIn: 'შესვლა',
        loggingIn: 'მიმდინარეობს შესვლა...',
        emailRequired: 'ელ. ფოსტა სავალდებულოა.',
        passwordRequired: 'პაროლი სავალდებულოა.',
        emailWhitespace: 'ელ. ფოსტა არ უნდა შეიცავდეს მხოლოდ ცარიელ სივრცეს.',
        passwordWhitespace: 'პაროლი არ უნდა შეიცავდეს მხოლოდ ცარიელ სივრცეს.',
      },
      dashboard: {
        title: 'სამოსის მაღაზია',
        subtitle: 'ადმინისტრატორის პანელი',
        adminPortal: 'ადმინ პორტალი',
        welcomeBack: 'კეთილი იყოს თქვენი დაბრუნება',
        manageShop: 'მართეთ თქვენი მაღაზია ამ პანელიდან',
      },
      nav: {
        products: 'პროდუქტები',
        offers: 'შეთავაზებები',
        orders: 'შეკვეთები',
        users: 'მომხმარებლები',
        settings: 'პარამეტრები',
        switchToCashier: 'მოლარის რეჟიმი',
        backToAdmin: 'ადმინ პანელში დაბრუნება',
      },
      cashier: {
        title: 'მოლარე',
        pointOfSale: 'გაყიდვების წერტილი',
        myOffers: 'ჩემი შეთავაზებები',
      },
      pos: {
        title: 'გაყიდვების წერტილი',
        subtitle: 'სკანირეთ ბარკოდი ან დათვალიერეთ კატალოგი. დაადასტურეთ მარაგის დონე და პროდუქტის ფოტოები მყიდველთან ერთად ნივთების კალათაში დამატებამდე.',
        inventory: 'ინვენტარი',
        inventorySubtitle: 'დათვალიერეთ კატალოგი ან მოძებნეთ, შემდეგ შეეხეთ ნივთს მის კალათაში დასამატებლად.',
        browseCatalog: 'კატალოგის დათვალიერება',
        hideProductList: 'პროდუქტების სიის დამალვა',
        searchPlaceholder: 'მოძებნეთ სახელით ან აღწერით',
        loadingCatalog: 'იტვირთება კატალოგი...',
        noItemsMatch: 'არც ერთი ნივთი არ ემთხვევა მიმდინარე ძებნას.',
        noDescription: 'აღწერა არ არის მოწოდებული.',
        inStock: 'მარაგში',
        cart: 'კალათა',
        items: 'ნივთები',
        total: 'სულ',
        cartEmpty: 'კალათა ცარიელია. აირჩიეთ პროდუქტი კატალოგიდან დასაწყებად.',
        unit: 'ერთეული:',
        leftInStock: 'დარჩა მარაგში',
        subtotal: 'ქვეჯამი',
        discounts: 'ფასდაკლებები',
        tax: 'გადასახადი',
        cash: 'ნაღდი',
        card: 'ბარათი',
        requestAdminDiscount: 'ადმინისგან ფასდაკლების მოთხოვნა',
        completeSale: 'დასრულება',
        selectAcquiringBank: 'აირჩიეთ გადამხდელი ბანკი',
        selectBankSubtitle: 'აირჩიეთ რომელი ბანკი დაამუშავებს ამ ბარათით გადახდას.',
        tbcBank: 'თიბისი ბანკი',
        bankOfGeorgia: 'საქართველოს ბანკი',
        shopCounter: 'მაღაზია / კასა',
        discountType: 'ფასდაკლების ტიპი',
        percentage: 'პროცენტი',
        manualAmount: 'ხელით მითითებული თანხა',
        value: 'მნიშვნელობა',
        notesToAdmin: 'შენიშვნები ადმინისთვის',
        notesPlaceholder: 'დაამატეთ ნებისმიერი კონტექსტი—მომხმარებლის ერთგულება, შეკვრა და ა.შ.',
        paymentMethod: 'გადახდის მეთოდი:',
        sendToAdmin: 'ადმინისთვის გაგზავნა',
        sending: 'იგზავნება...',
      },
      offersStatus: {
        title: 'ჩემი შეთავაზებები',
        subtitle: 'თვალი ადევნეთ ფასდაკლების მოთხოვნების სტატუსს, რომლებიც წარადგინეთ ადმინისთვის.',
        loadingOffers: 'იტვირთება შეთავაზებები...',
        noOffersYet: 'შეთავაზებები ჯერ არ არის',
        noOffersSubtitle: 'ფასდაკლების მოთხოვნები, რომლებსაც წარადგენთ, აქ გამოჩნდება.',
        submitted: 'წარდგენილია:',
        items: 'ნივთები:',
        discountType: 'ფასდაკლების ტიპი:',
        discountValue: 'ფასდაკლების მნიშვნელობა:',
        cartTotal: 'კალათის ჯამი:',
        paymentMethod: 'გადახდის მეთოდი:',
        note: 'შენიშვნა:',
        pending: 'მოლოდინში',
        approved: 'დამტკიცებული',
        rejected: 'უარყოფილი',
        fixedAmount: 'ფიქსირებული თანხა',
        cardTBC: 'ბარათი (თიბისი ბანკი)',
        cardBOG: 'ბარათი (საქართველოს ბანკი)',
      },
      products: {
        title: 'პროდუქტების კატალოგი',
        subtitle: 'გადახედეთ ინვენტარს, შეცვალეთ მარაგის დონეები და დაამატეთ ახალი ნივთები.',
        addProduct: 'პროდუქტის დამატება',
        editProduct: 'პროდუქტის რედაქტირება',
        totalProducts: 'სულ პროდუქტები',
        lowStock: 'დაბალი მარაგი (< 5)',
        searchPlaceholder: 'მოძებნეთ სახელით ან აღწერით',
        noProducts: 'პროდუქტები არ მოიძებნა.',
        name: 'სახელი',
        price: 'ფასი',
        quantity: 'რაოდენობა',
        size: 'ზომა',
        sizeOptional: 'ზომა (არასავალდებულო)',
        description: 'აღწერა',
        image: 'სურათი',
        inStock: 'მარაგში',
        lastUpdated: 'ბოლო განახლება',
        actions: 'მოქმედებები',
        productImage: 'პროდუქტის სურათი',
        uploadFile: '📁 ფაილის ატვირთვა',
        useUrl: '🔗 URL-ის გამოყენება',
        enterUrl: 'შეიყვანეთ სურათის პირდაპირი URL',
        preview: 'გადახედვა:',
        saveProduct: 'პროდუქტის შენახვა',
        updateProduct: 'პროდუქტის განახლება',
        saving: 'შენახვა...',
        fileFormats: 'მხარდაჭერილი ფორმატები: JPG, PNG, GIF, WebP • მაქს. ზომა: 5MB',
        selected: 'არჩეულია:',
        units: 'ცალი',
        location: 'ლოკაცია',
        locationOptional: 'ლოკაცია (არასავალდებულო)',
        initialCost: 'საწყისი ღირებულება',
        initialCostOptional: 'საწყისი ღირებულება (არასავალდებულო)',
      },
      offers: {
        title: 'შეთავაზებები და ფასდაკლებები',
        subtitle: 'გადახედეთ მაღაზიების მოთხოვნებს, დაამტკიცეთ ფასდაკლებები ან შექმენით ახალი შეთავაზება.',
        newOffer: 'ახალი შეთავაზება',
        totalOffers: 'სულ შეთავაზებები',
        pendingApproval: 'დამტკიცების მოლოდინში',
        approved: 'დამტკიცებული',
        createOffer: 'შეთავაზების შექმნა',
        noOffers: 'შეთავაზებები ჯერ არ არის.',
        approve: 'დამტკიცება',
        reject: 'უარყოფა',
      },
      orders: {
        title: 'გაყიდვების ისტორია',
        subtitle: 'თვალყური ადევნეთ ბოლო შეკვეთებს, გადახდის მეთოდებს და ჯამებს.',
        ordersRecorded: 'ჩაწერილი შეკვეთები',
        totalRevenue: 'მთლიანი შემოსავალი',
        lastOrder: 'ბოლო შეკვეთა',
        noOrders: 'შეკვეთები არ მოიძებნა.',
        orderNumber: 'შეკვეთა #',
        items: 'ნივთები',
        total: 'სულ',
        cashier: 'მოლარე:',
      },
      paymentMethods: {
        cash: 'ნაღდი',
        card: 'ბარათი',
        tbcBank: 'თიბისი ბანკი',
        bankOfGeorgia: 'საქართველოს ბანკი',
      },
      settings: {
        title: 'აპლიკაციის პარამეტრები',
        subtitle: 'კონფიგურაცია გლობალური პარამეტრები თქვენი მაღაზიისთვის',
        generalConfig: 'ზოგადი კონფიგურაცია',
        taxRate: 'გადასახადის განაკვეთი (%)',
        currency: 'ვალუტა',
        lowStockThreshold: 'დაბალი მარაგის ზღვარი',
        saveChanges: 'ცვლილებების შენახვა',
        resetDefaults: 'საწყის მნიშვნელობებზე დაბრუნება',
        infoTitle: 'ინფორმაცია',
        infoMessage: 'ამ პარამეტრების ცვლილებები გავლენას მოახდენს ყველა მომავალ ტრანზაქციასა და ანგარიშზე.',
        taxHelper: 'შეიყვანეთ გადასახადის პროცენტი გაყიდვებისთვის',
        currencyHelper: 'ვალუტის ნაგულისხმევი კოდი (მაგ., USD, EUR, GEL)',
        lowStockHelper: 'ნივთები ამ რაოდენობაზე დაბლა მონიშნული იქნება როგორც დაბალი მარაგი (მინიმუმი: 1)',
        successMessage: 'პარამეტრები წარმატებით შენახულია!',
        errorMessage: 'პარამეტრების შენახვა ვერ მოხერხდა. გთხოვთ სცადოთ ხელახლა.',
      },
      theme: {
        dark: 'ბნელი',
        light: 'ღია',
      },
      reports: {
        userPerformance: 'მომხმარებლის შესრულება',
        userPerformanceSubtitle: 'თვალყური ადევნეთ გაყიდვების მეტრიკას და შესრულებას მომხმარებლების მიხედვით',
        cashierPerformance: 'მოლარის შესრულება',
        totalRevenue: 'მთლიანი შემოსავალი',
        totalTransactions: 'მთლიანი ტრანზაქციები',
        activeUsers: 'აქტიური მომხმარებლები',
        userRankings: 'მომხმარებლების რეიტინგი',
        exportCSV: 'CSV ექსპორტი',
        noSalesData: 'გაყიდვების მონაცემები არ არის ხელმისაწვდომი',
        noSalesSubtitle: 'ამ პერიოდში არცერთმა მომხმარებელმა არ ჩაწერა გაყიდვები',
        revenue: 'შემოსავალი',
        transactions: 'ტრანზაქციები',
        avgSale: 'საშ. გაყიდვა',
        period: 'პერიოდი',
        status: 'სტატუსი',
        noSalesRecorded: 'გაყიდვები არ არის ჩაწერილი',
        role: 'როლი',
        admin: 'ადმინი',
        cashier: 'მოლარე',
        thisMonth: 'ამ თვეში',
        lastMonth: 'წინა თვეში',
        thisYear: 'წელს',
        applyFilters: 'ფილტრების გამოყენება',
        from: 'საიდან',
        to: 'სადამდე',
        dateRange: 'თარიღის დიაპაზონი',
      },
      users: {
        title: 'მომხმარებლები',
        subtitle: 'სისტემის მომხმარებლების მართვა',
        totalUsers: 'მთლიანი მომხმარებლები',
        addUser: 'მომხმარებლის დამატება',
        editUser: 'მომხმარებლის რედაქტირება',
        createUser: 'შექმნა',
        updateUser: 'განახლება',
        deleteUser: 'წაშლა',
        noUsers: 'მომხმარებლები არ მოიძებნა',
        name: 'სახელი',
        surname: 'გვარი',
        email: 'ელ. ფოსტა',
        password: 'პაროლი',
        role: 'როლი',
        admin: 'ადმინი',
        cashier: 'მოლარე',
        createdAt: 'შექმნის თარიღი',
        actions: 'მოქმედებები',
        namePlaceholder: 'შეიყვანეთ სახელი',
        surnamePlaceholder: 'შეიყვანეთ გვარი',
        emailPlaceholder: 'შეიყვანეთ ელ. ფოსტა',
        passwordPlaceholder: 'შეიყვანეთ პაროლი',
        emailRequired: 'ელ. ფოსტა აუცილებელია',
        passwordRequired: 'პაროლი აუცილებელია (მინიმუმ 6 სიმბოლო)',
        deleteConfirmTitle: 'მომხმარებლის წაშლა',
        deleteConfirmMessage: 'დარწმუნებული ხართ რომ გსურთ წაშალოთ მომხმარებელი',
      },
    };
  }

  private getEnglishTranslations(): Translations {
    return {
      common: {
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        close: 'Close',
        refresh: 'Refresh',
        loading: 'Loading',
        search: 'Search',
        logout: 'Logout',
        clear: 'Clear',
        remove: 'Remove',
        submit: 'Submit',
        yes: 'Yes',
        no: 'No',
      },
      login: {
        signIn: 'Sign In',
        email: 'Email',
        password: 'Password',
        logIn: 'Log In',
        loggingIn: 'Logging in...',
        emailRequired: 'Email is required.',
        passwordRequired: 'Password is required.',
        emailWhitespace: 'Email cannot contain only whitespace.',
        passwordWhitespace: 'Password cannot contain only whitespace.',
      },
      dashboard: {
        title: 'Clothing Shop',
        subtitle: 'Admin Dashboard',
        adminPortal: 'Admin Portal',
        welcomeBack: 'Welcome back',
        manageShop: 'Manage your clothing shop from this dashboard',
      },
      nav: {
        products: 'Products',
        offers: 'Offers',
        orders: 'Orders',
        users: 'Users',
        settings: 'Settings',
        switchToCashier: 'Cashier View',
        backToAdmin: 'Back to Admin',
      },
      cashier: {
        title: 'Cashier',
        pointOfSale: 'Point of Sale',
        myOffers: 'My Offers',
      },
      pos: {
        title: 'Point of Sale',
        subtitle: 'Scan a barcode or browse the catalog. Confirm stock level and product photos with customer before adding items to cart.',
        inventory: 'Inventory',
        inventorySubtitle: 'Browse the catalog or search, then tap an item to add to cart.',
        browseCatalog: 'Browse Catalog',
        hideProductList: 'Hide Product List',
        searchPlaceholder: 'Search by name or description',
        loadingCatalog: 'Loading catalog...',
        noItemsMatch: 'No items match the current search.',
        noDescription: 'No description provided.',
        inStock: 'in stock',
        cart: 'Cart',
        items: 'items',
        total: 'Total',
        cartEmpty: 'Cart is empty. Select a product from the catalog to begin.',
        unit: 'Unit:',
        leftInStock: 'left in stock',
        subtotal: 'Subtotal',
        discounts: 'Discounts',
        tax: 'Tax',
        cash: 'Cash',
        card: 'Card',
        requestAdminDiscount: 'Request Discount from Admin',
        completeSale: 'Complete Sale',
        selectAcquiringBank: 'Select Acquiring Bank',
        selectBankSubtitle: 'Choose which bank will process this card payment.',
        tbcBank: 'TBC Bank',
        bankOfGeorgia: 'Bank of Georgia',
        shopCounter: 'Shop / Counter',
        discountType: 'Discount Type',
        percentage: 'Percentage',
        manualAmount: 'Manual Amount',
        value: 'Value',
        notesToAdmin: 'Notes to Admin',
        notesPlaceholder: 'Add any context—customer loyalty, bundling, etc.',
        paymentMethod: 'Payment Method:',
        sendToAdmin: 'Send to Admin',
        sending: 'Sending...',
      },
      offersStatus: {
        title: 'My Offers',
        subtitle: "Track the status of discount requests you've submitted to admin.",
        loadingOffers: 'Loading offers...',
        noOffersYet: 'No offers yet',
        noOffersSubtitle: 'Discount requests you submit will appear here.',
        submitted: 'Submitted:',
        items: 'Items:',
        discountType: 'Discount Type:',
        discountValue: 'Discount Value:',
        cartTotal: 'Cart Total:',
        paymentMethod: 'Payment Method:',
        note: 'Note:',
        pending: 'Pending',
        approved: 'Approved',
        rejected: 'Rejected',
        fixedAmount: 'Fixed Amount',
        cardTBC: 'Card (TBC Bank)',
        cardBOG: 'Card (Bank of Georgia)',
      },
      products: {
        title: 'Product Catalog',
        subtitle: 'Review inventory, adjust stock levels, and add new items.',
        addProduct: 'Add Product',
        editProduct: 'Edit Product',
        totalProducts: 'Total products',
        lowStock: 'Low stock (< 5)',
        searchPlaceholder: 'Search by name or description',
        noProducts: 'No products match the current filters.',
        name: 'Name',
        price: 'Price',
        quantity: 'Quantity',
        size: 'Size',
        sizeOptional: 'Size (optional)',
        description: 'Description',
        image: 'Image',
        inStock: 'In stock',
        lastUpdated: 'Last updated',
        actions: 'Actions',
        productImage: 'Product Image',
        uploadFile: '📁 Upload File Instead',
        useUrl: '🔗 Use URL Instead',
        enterUrl: 'Enter a direct URL to an image',
        preview: 'Preview:',
        saveProduct: 'Save Product',
        updateProduct: 'Update Product',
        saving: 'Saving...',
        fileFormats: 'Supported formats: JPG, PNG, GIF, WebP • Max size: 5MB',
        selected: 'Selected:',
        units: 'units',
        location: 'Location',
        locationOptional: 'Location (Optional)',
        initialCost: 'Initial Cost',
        initialCostOptional: 'Initial Cost (Optional)',
      },
      offers: {
        title: 'Offers & Discounts',
        subtitle: 'Review cross-shop requests, approve discounts, or create a new offer.',
        newOffer: 'New offer',
        totalOffers: 'Total offers',
        pendingApproval: 'Pending approval',
        approved: 'Approved',
        createOffer: 'Create offer',
        noOffers: 'No offers yet.',
        approve: 'Approve',
        reject: 'Reject',
      },
      orders: {
        title: 'Sales History',
        subtitle: 'Track recent orders, payment methods, and totals.',
        ordersRecorded: 'Orders recorded',
        totalRevenue: 'Total revenue',
        lastOrder: 'Last order',
        noOrders: 'No orders were found.',
        orderNumber: 'Order #',
        items: 'Items',
        total: 'Total',
        cashier: 'Cashier:',
      },
      paymentMethods: {
        cash: 'Cash',
        card: 'Card',
        tbcBank: 'TBC Bank',
        bankOfGeorgia: 'Bank of Georgia',
      },
      settings: {
        title: 'Application Settings',
        subtitle: 'Configure global settings for your clothing shop',
        generalConfig: 'General Configuration',
        taxRate: 'Tax Rate (%)',
        currency: 'Currency',
        lowStockThreshold: 'Low Stock Threshold',
        saveChanges: 'Save Changes',
        resetDefaults: 'Reset to Defaults',
        infoTitle: 'Information',
        infoMessage: 'Changes to these settings will affect all future transactions and reports.',
        taxHelper: 'Enter the tax percentage to apply to sales',
        currencyHelper: 'Default currency code (e.g., USD, EUR, GBP)',
        lowStockHelper: 'Items below this quantity will be marked as low stock (minimum: 1)',
        successMessage: 'Settings saved successfully!',
        errorMessage: 'Failed to save settings. Please try again.',
      },
      theme: {
        dark: 'Dark',
        light: 'Light',
      },
      reports: {
        userPerformance: 'User Performance',
        userPerformanceSubtitle: 'Track sales metrics and performance by user',
        cashierPerformance: 'Cashier Performance',
        totalRevenue: 'Total Revenue',
        totalTransactions: 'Total Transactions',
        activeUsers: 'Active Users',
        userRankings: 'User Rankings',
        exportCSV: 'Export CSV',
        noSalesData: 'No sales data available',
        noSalesSubtitle: 'No users have recorded sales in this period',
        revenue: 'Revenue',
        transactions: 'Transactions',
        avgSale: 'Avg Sale',
        period: 'Period',
        status: 'Status',
        noSalesRecorded: 'No sales recorded',
        role: 'Role',
        admin: 'Admin',
        cashier: 'Cashier',
        thisMonth: 'This Month',
        lastMonth: 'Last Month',
        thisYear: 'This Year',
        applyFilters: 'Apply Filters',
        from: 'From',
        to: 'To',
        dateRange: 'Date Range',
      },
      users: {
        title: 'Users',
        subtitle: 'Manage system users',
        totalUsers: 'Total Users',
        addUser: 'Add User',
        editUser: 'Edit User',
        createUser: 'Create',
        updateUser: 'Update',
        deleteUser: 'Delete',
        noUsers: 'No users found',
        name: 'Name',
        surname: 'Surname',
        email: 'Email',
        password: 'Password',
        role: 'Role',
        admin: 'Admin',
        cashier: 'Cashier',
        createdAt: 'Created At',
        actions: 'Actions',
        namePlaceholder: 'Enter name',
        surnamePlaceholder: 'Enter surname',
        emailPlaceholder: 'Enter email',
        passwordPlaceholder: 'Enter password',
        emailRequired: 'Email is required',
        passwordRequired: 'Password is required (min 6 characters)',
        deleteConfirmTitle: 'Delete User',
        deleteConfirmMessage: 'Are you sure you want to delete user',
      },
    };
  }
}
