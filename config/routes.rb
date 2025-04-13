Rails.application.routes.draw do
  devise_for :users

  root "dashboard#index"

  get "dashboard", to: "dashboard#index"

  resources :boards do
    resources :lists
    resources :board_users, only: [ :new, :create ]
  end

  resources :items do
    resources :item_members, only: [ :new, :create ]
  end

  resources :lists do
    resources :items
  end

  namespace :api do
    resources :boards do
      resources :lists, only: :index, controller: "lists"
      resources :list_positions, only: [ :index, :update ], controller: "list_positions"
    end
    put "item_positions", to: "item_positions#update"

    resources :items, only: :show
  end
end
